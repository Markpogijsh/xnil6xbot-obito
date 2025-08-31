const axios = require('axios');

module.exports = {
  config: {
    name: "sim",
    aliases: ["simsimi", "talk"],
    version: "1.0.0",
    author: "Keijo",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Talk with a SimSimi-like AI"
    },
    longDescription: {
      en: "Chat with a SimSimi-style chatbot using an external API"
    },
    category: "fun",
    guide: {
      en: "{pn} [message] - Chat with Sim"
    }
  },

  /**
   * Main entry point when the command is triggered
   * @param {Object} param0 - Command context
   * @param {import('goatbot').Message} param0.message - Message object for replying
   * @param {Array<string>} param0.args - Arguments passed after command name
   */
  onStart: async function ({ message, args }) {
    const input = args.join(" ").trim();

    if (!input) {
      // No message from user, reply with prompt
      return message.reply("❌ Please say something to Sim!");
    }

    try {
      // Call the external SimSimi-like API
      const res = await axios.get(`https://daikyu-api.up.railway.app/api/sim-simi?talk=${encodeURIComponent(input)}`);

      // Extract the response text or fallback message
      const reply = res.data.response || "❌ No response from Sim.";

      // Send the reply back to user
      message.reply(reply);
    } catch (err) {
      // Log error to console and notify user
      console.error(err);
      message.reply("❌ Failed to get a response from Sim.");
    }
  }
};