const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    version: "1.1",
    author: "Keijo",
    countDown: 3,
    role: 0,
    description: "AI assistant with Aria API (with GPT fallback), no prefix needed",
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

  onChat: async function ({ api, event, message, getLang }) {
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

    // Send loading msg para mukhang typing muna
    api.sendMessage("⌛ Loading AI response...", event.threadID, async (err, info) => {
      if (err) return;

      try {
        // MAIN API → Aria
        const { data } = await axios.get(
          "https://betadash-api-swordslush-production.up.railway.app/Aria",
          {
            params: {
              ask: prompt,
              userid: "61579032975023",
              stream: "hatdog"
            }
          }
        );

        if (data.status === "200" && data.response) {
          return api.editMessage(data.response, info.messageID, event.threadID);
        } else {
          throw new Error("Aria returned invalid response");
        }
      } catch (err) {
        console.error("Aria API error:", err.message);

        // FALLBACK → GPT API
        try {
          const url = `https://urangkapolka.vercel.app/api/chatgpt4?prompt=${encodeURIComponent(prompt)}`;
          const res = await axios.get(url);

          if (res.data && res.data.response) {
            return api.editMessage(res.data.response, info.messageID, event.threadID);
          } else {
            throw new Error("GPT API no response");
          }
        } catch (backupErr) {
          console.error("GPT API error:", backupErr.message);
          return api.editMessage(getLang("error"), info.messageID, event.threadID);
        }
      }
    });
  }
};