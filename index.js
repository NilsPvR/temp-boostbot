const dotenv = require('dotenv');
dotenv.config();
const { prefix, colors } = require('./config.json');

const Discord = require('discord.js');

const client = new Discord.Client({
	disableMentions: 'everyone',
	presence: {
		activity: { name: `${prefix}boosters`, type: 'LISTENING' },
	},
	ws: {
		intent: ['GUILD_MEMBERS'],
	},
});

// const fs = require('fs'); // node native file system
// const path = require('path'); // node native path module


const { MessageEmbed } = require('discord.js');
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const { getMember } = require('./util/getMember');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	if (message.author.bot || message.channel.type == 'dm') return;

	// if (message.content.toLowerCase() == 's!boosters') {
	// 	message.channel.send(`<@${message.author.id}>, try using \`${prefix}boosters\` or \`${prefix}booster\` for now.`);
	// }

	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
	if(!prefixRegex.test(message.content.toLowerCase())) return; // test prefix

	const [, matchedPrefix] = prefixRegex.test(message.content.toLowerCase()) ? message.content.toLowerCase().match(prefixRegex) : '';
	const messageWOprefix = message.content.slice(matchedPrefix.length);

	const args = messageWOprefix.trim().split(/ +/);
	const command = args.shift().toLowerCase(); // the command which user has entered

	try {
		if (command === 'boosters') {
			/* Fields are limited to 2048 chars:
				a discord name has max. 32chars -> each field 20members = 32*20 = 640
				seperators + date: 5 + date = 5 + 8 = 13
				indicator: estimated max: 4
				 -> = 657
			  max 25 fields:
			  	20 boosters per field * 25 = 500 boosters
			*/

			const members = await message.guild.members.fetch();

			const boostMembers = members.filter(mem => mem.premiumSinceTimestamp) // sort all boosters by timestamp of when they started bossting
				.sort((aMem, bMem) => aMem.premiumSinceTimestamp - bMem.premiumSinceTimestamp);

			const inputtedMember = await getMember(message, args.join(' '), members);

			let index = 1;
			const fieldArr = [];

			while(boostMembers.size > 20) { // add all boosters in groups of 20
				let boostersMsg20 = '';
				for(let i = 0; i < 20; i++) {
					const boostmem = boostMembers.first(); // get first member

					// look for the specified member
					if (inputtedMember?.id == boostmem.id) boostersMsg20 += `\n\u2000${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`;
					// add a space to mark the message author, if noone else defined
					else if (message.member.id == boostmem.id && !inputtedMember) boostersMsg20 += `\n\u2000${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`;
					else boostersMsg20 += `\n${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`;

					boostMembers.delete(boostMembers.firstKey()); // delete the member
				}

				fieldArr.push({
					name: '\u200B',
					value: boostersMsg20,
				});
			}


			let boostersMsg20 = '';
			const size = boostMembers.size;
			for(let i = 0; i < size; i++) { // iterate over the last members
				const boostmem = boostMembers.first(); // get first member
				// look for the specified member
				if (inputtedMember?.id == boostmem.id) boostersMsg20 += `\n\u2000${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`;
				// add a space to mark the message author, if noone else defined
				else if (message.member.id == boostmem.id && !inputtedMember) boostersMsg20 += `\n\u2000${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`;
				else boostersMsg20 += `\n${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`;
				boostMembers.delete(boostMembers.firstKey()); // delete the member
			}

			fieldArr.push({
				name: '\u200B',
				value: boostersMsg20,
			});

			for (let i = 0; i < fieldArr.length; i++) { // check all fields
				if (fieldArr[i].value?.charAt(1) == '\u2000') { // if the first member in the field is supposed to be intented
					fieldArr[i].value = '່' + fieldArr[i].value.substring(1); // replace \n with special char so discord doesn't remove the space \u2000
				}
			}

			if (fieldArr.length > 25) { // remove all fields that are more then 25
				fieldArr.splice(25, fieldArr.length - 25);
			}
			const description = (fieldArr.length > 25) ? 'It seems like there are more then 500 boosters o.O. I am currently unable to display all boosters therefore only the first 500 boosters will be displayed' : '';

			return message.channel.send(new MessageEmbed()
				.setColor(colors.pink)
				.setTitle(`Nitro Boosters in ${message.channel.guild.name}`)

				.setDescription(description)
				.addFields(fieldArr))
				.catch(console.error);
		}
		if (command == 'booster') {
			const members = await message.guild.members.fetch();

			const boostMembers = members.filter(mem => mem.premiumSinceTimestamp) // sort all boosters by timestamp of when they started bossting
				.sort((aMem, bMem) => aMem.premiumSinceTimestamp - bMem.premiumSinceTimestamp)
				.map(member => member);

			let inputtedMember;
			if (!args[0]) {
				inputtedMember = message.member;
			}
			else {
				inputtedMember = await getMember(message, args.join(' '), members);
			}
			if (!inputtedMember) return;

			const boostingPlace = boostMembers.findIndex(mem => mem.id == inputtedMember.id) + 1;
			if (boostingPlace === -1 || boostingPlace === 0) {
				return message.channel.send(new MessageEmbed()
					.setColor(colors.red)

					.setDescription((inputtedMember.id == message.member) ? 'You are currently not boosting the server!' : `\`${args.join(' ')}\` is currently not boosting the server!`));
			}


			return message.channel.send(new MessageEmbed()
				.setColor(colors.pink)
				.setTitle('Boosting place')

				.setDescription(`<@${inputtedMember.id}> is currently the **${boostingPlace}.** booster on this server!`)
				.setFooter(`${inputtedMember.user.tag} - ${inputtedMember.id}`));


		}
		else {
			message.channel.send(`The only commands I currently provide are \`${prefix}boosters [member]\` and \`${prefix}booster [member]\`!\n\nThe \`[member]\` is optional.`);
		}
	}
	catch(error) {
		console.error(error);
	}
});


client.login(process.env.TOKEN)
	.catch(console.error);