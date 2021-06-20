const { colors } = require('../config.json');

// only allow id's or mentions | (id)
const idregex = new RegExp(/^(?:<@!?)?(\d{18})>?$/i);
// only allow discord tags | (tag)
const tagregex = new RegExp(/(^.{2,}#\d{4})$/i);

async function fgetMember(message, arg, members) {
	if (message.channel.type === 'dm') return;
	// get the id from mention or just plain id, check for 'y' at the end
	const idMatches = arg.match(idregex);
	const tagMatches = arg.match(tagregex);

	if (!idMatches) { // search by name
		let foundMember;

		if (tagMatches) {
			foundMember = members.find(mem => mem.user.tag == tagMatches[1]); // if they use Metzok#6146yes -> get the tag like this
			foundMember = foundMember ?? members.find(mem => mem.user.tag.toLowerCase() == tagMatches[1]?.toLowerCase());
		}
		else {
			// if any of tag,name,nicknam matches then return the member
			foundMember = members.find(mem => mem.user.tag == arg || mem.user.username == arg || mem.nickname == arg);

			// if nothing has been found try searching case insensitive
			arg = arg.toLowerCase();
			foundMember = foundMember ?? members.find(mem => mem.user.tag.toLowerCase() == arg
				|| mem.user.username.toLowerCase() == arg || mem.nickname?.toLowerCase() == arg);
		}
		return foundMember;
	}
	else {
		// fetch the member, Take the second element since the first is the whole thing
		const returnMember = await message.guild.members.fetch(idMatches[1])
			.catch((error) => {
				console.error(`Error initiated in mention.js: ${error.message}`);
			});
		return returnMember;

	}
}


module.exports = {
	async getMember(message, arg, members) { // if found and optinaly confirmed: returns an object with member, reason
		if (!arg) return;
		const member = await fgetMember(message, arg, members); // send a copy
		const idMatches = arg.match(idregex);
		const tagMatches = arg.match(tagregex);
		const simpleName = arg;


		// if they used IDy -> then only ID | if they used Metzok#6146yes -> then only tag | nickname: then first arg assuming not spaces in name
		const inputtedname = idMatches?.[1] ?? tagMatches?.[1] ?? simpleName;

		// only check if member exists
		let inputType;

		if (idregex.test(arg)) inputType = 'ID'; // they used an ID
		else if (tagregex.test(arg)) inputType = 'tag'; // they used a tag
		else inputType = 'name';

		if (!member) { // invalid input
			message.channel.send({ embed:
				{ // embed object
					color: colors.red,
					description: `Unable to find someone on this server with the ${inputType}: ${inputtedname}`,
				},
			});
		}

		return member;
	},
};