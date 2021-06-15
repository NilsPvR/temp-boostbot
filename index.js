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

const fs = require('fs'); // node native file system
const path = require('path'); // node native path module


const { MessageEmbed } = require('discord.js');
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
	if (message.author.bot || message.channel.type == 'dm' || !prefixRegex.test(message.content)) return;

	const [, matchedPrefix] = prefixRegex.test(message.content) ? message.content.match(prefixRegex) : '';
	const messageWOprefix = message.content.slice(matchedPrefix.length);

	const args = messageWOprefix.trim().split(/ +/);
	const command = args.shift().toLowerCase(); // the command which user has entered

	if (command === 'ping') {
		message.channel.send('Pong.');
	}
	else if (command === 'beep') {
		message.channel.send('Boop.');
	}
	// ...
});


client.login(process.env.TOKEN)
	.catch(console.error);