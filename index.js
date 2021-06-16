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
	if (message.content == 's!boosters') {
		message.reply('try using `b!boosters` for now.');
	}
	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
	if (message.author.bot || message.channel.type == 'dm' || !prefixRegex.test(message.content)) return;

	const [, matchedPrefix] = prefixRegex.test(message.content) ? message.content.match(prefixRegex) : '';
	const messageWOprefix = message.content.slice(matchedPrefix.length);

	const args = messageWOprefix.trim().split(/ +/);
	const command = args.shift().toLowerCase(); // the command which user has entered

	try {
		if (command === 'boosters') {

			const members = await message.guild.members.fetch();

			const boostMembers = members.filter(mem => mem.premiumSinceTimestamp)
				.sort((aMem, bMem) => aMem.premiumSinceTimestamp - bMem.premiumSinceTimestamp);

			const boostersMsg = [];

			let index = 1;
			boostMembers.map(boostmem => {
				// console.log(boostmem.premiumSinceTimestamp);
				// console.log(boostmem.displayName);
				boostersMsg.push(`\n${index++}. **${boostmem.displayName}** - (${boostmem.premiumSince.toLocaleDateString('en-US')})`);
			});

			const fieldArr = [{}, {}, {}, {}, {}];

			let counter = 0;
			while(boostersMsg.length > 20) {
				let value = '';
				for(let i = 0; i < 20; i++) {
					value += boostersMsg.shift();
				}
				fieldArr[counter].name = '\u200B';
				fieldArr[counter++].value = value;
			}
			fieldArr[4] = { name: '\u200B', value: boostersMsg.join('') };

			return message.channel.send(new MessageEmbed()
				.setColor('F697FF')
				.setTitle(`Nitro Boosters in ${message.channel.guild.name}`)
				.addFields(fieldArr[0], fieldArr[1], fieldArr[2], fieldArr[3], fieldArr[4]));
			// message.channel.send(`Nitro Boosters in "${message.channel.guild.name}":\n${boostersMsg}`, { split: true });
		}
		else if (command === 'beep') {
			message.channel.send(`The only command I currently provide is ${prefix}boosters!`);
		}
	}
	catch(error) {
		console.error();
	}
});


client.login(process.env.TOKEN)
	.catch(console.error);