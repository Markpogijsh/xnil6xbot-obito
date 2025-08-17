const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: "Thay đổi dấu lệnh của bot trong box chat của bạn hoặc cả hệ thống bot (chỉ admin bot)",
		category: "config",
		guide: {
			vi: "   {pn} <new prefix>: thay đổi prefix mới trong box chat của bạn"
				+ "\ụ:"
				+ "\} #"
				+ "\} <new prefix> -g: thay đổi prefix mới trong hệ thống bot (chỉ admin bot)"
				+ "\ụ:"
				+ "\} # -g"
				+ "\} reset: thay đổi prefix trong box chat của bạn về mặc định",
			en: "   {pn} <new prefix>: change new prefix in your box chat"
				+ "\ple:"
				+ "\} #"
				+ "\} <new prefix> -g: change new prefix in system bot (only admin bot)"
				+ "\ple:"
				+ "\} # -g"
				+ "\} reset: change prefix in your box chat to default"
		}
	},

	langs: {
		vi: {
			reset: "Đã reset prefix của bạn về mặc định: %1",
			onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
			confirmGlobal: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix của toàn bộ hệ thống bot",
			confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
			successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
			successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1",
			myPrefix: "🌐 Prefix của hệ thống: %1\ix của nhóm bạn: %2"
		},
		en: {
			reset: "Your prefix has been reset to default: %1",
			onlyAdmin: "Only admin can change prefix of system bot",
			confirmGlobal: "Please react to this message to confirm change prefix of system bot",
			confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
			successGlobal: "Changed prefix of system bot to: %1",
			successThisThread: "Changed prefix in your box chat to: %1",
			myPrefix: "👋 𝐇𝐞𝐲 𝐝𝐢𝐝 𝐲𝐨𝐮 𝐚𝐬𝐤 𝐟𝐨𝐫 𝐦𝐲 𝐩𝐫𝐞𝐟𝐢𝐱?
➥ 🌐 𝐆𝐥𝐨𝐛𝐚𝐥: .
➥ 💬 𝐓𝐡𝐢𝐬 𝐂𝐡𝐚𝐭: .
𝐈'𝐦 , 𝗞𝗘𝗜𝗝𝗢 𝗔𝗜 𝐧𝐢𝐜𝐞 𝐭𝐨 𝐦𝐞𝐞𝐭 𝐲𝐨𝐮!"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}
  const helpListImages = [
        "https://i.ibb.co/HgN9N8H/image.jpg",
        "https://i.ibb.co/BVqHC54/image.jpg",
        "https://i.ibb.co/54hpf9s/image.jpg",
        "https://i.ibb.co/8xjnwfk/image.jpg",
        // Add more image links as needed
      ];

      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];
		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g")
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		else
			formSet.setGlobal = false;

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix")
			return () => {
				return message.reply(getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)));
			};
	}
};