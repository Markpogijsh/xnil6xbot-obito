const axios = require("axios");

module.exports = {
	config: {
		name: "ai",
		version: "1.0",
		author: "keijo",
		countDown: 3,
		role: 0,
		description: "AI assistant with Aria API, no prefix needed",
		category: "fun",
		guide: {
			en: "Type 'ai <your question>' to chat with Aria AI assistant.",
			vi: "Gõ 'ai <câu hỏi>' để trò chuyện với AI Aria."
		}
	},

	langs: {
		en: {
			noQuestion: "Please provide a question first.",
			error: "❌ Sorry, something went wrong. Please try again later."
		},
		vi: {
			noQuestion: "Vui lòng nhập câu hỏi trước.",
			error: "❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
		}
	},

	onStart: async function () {},

	onChat: async function ({ event, message, getLang }) {
		if (!event.body) return;

		const content = event.body.trim();
		const lower = content.toLowerCase();

		// Check if message starts with "ai"
		if (!lower.startsWith("ai")) return;

		// Extract prompt after "ai"
		const prompt = content.slice(2).trim();

		if (!prompt) {
			// No question after "ai"
			return message.reply(getLang("noQuestion"));
		}

		try {
			const { data } = await axios.get("https://betadash-api-swordslush-production.up.railway.app/Aria", {
				params: {
					ask: prompt,
					userid: "61579032975023",
					stream: "hatdog"
				}
			});

			if (data.status !== "200" || !data.response) {
				return message.reply(getLang("error"));
			}

			return message.reply(data.response);

		} catch (err) {
			console.error("Aria API error:", err.response ? err.response.data : err.message);
			return message.reply(getLang("error"));
		}
	}
};