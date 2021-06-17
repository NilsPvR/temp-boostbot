const dotenv = require('dotenv');
dotenv.config();
const { prefix } = require('./config.json');

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

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	if (message.content.toLowerCase() == 's!boosters') {
		message.reply('try using `b!boosters` for now.');
	}
	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
	if (message.author.bot || message.channel.type == 'dm' || !prefixRegex.test(message.content.toLowerCase())) return;

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


			let index = 1;
			const boostersMsg = boostMembers.map(boostmem => {
				// creates an array with one entry per booster
				return `\n${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`;
			});

			const fieldArr = [];

			while(boostersMsg.length > 20) { // add all boosters in groups of 20
				let boostersMsg20 = '';
				for(let i = 0; i < 20; i++) {
					boostersMsg20 += boostersMsg.shift(); // remove the first element since the arr is in reverse order
				}

				fieldArr.push({
					name: '\u200B',
					value: boostersMsg20,
				});
			}
			fieldArr.push({ name: '\u200B', value: boostersMsg.join('') }); // add last items

			if (fieldArr.length > 25) { // remove all items that are more then 25
				fieldArr.splice(25, fieldArr.length - 25);
			}
			const description = (fieldArr.length > 25) ? 'It seems like there are more then 500 boosters o.O. I am currently unable to display all boosters therefore only the first 500 boosters will be displayed' : '';

			return message.channel.send(new MessageEmbed()
				.setColor('F697FF')
				.setTitle(`Nitro Boosters in ${message.channel.guild.name}`)

				.setDescription(description)
				.addFields(fieldArr));
			// message.channel.send(`Nitro Boosters in "${message.channel.guild.name}":\n${boostersMsg}`, { split: true });
		}
		else {
			message.channel.send(`The only command I currently provide is \`${prefix}boosters\`!`);
		}
	}
	catch(error) {
		console.error();
	}
});


client.login(process.env.TOKEN)
	.catch(console.error);