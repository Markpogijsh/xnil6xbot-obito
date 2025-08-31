const axios = require('axios');

module.exports = {
  config: {
    name: "sim",
    version: "1.0",
    author: "Prince",
    description: "A simple SimSimi-like command",
    usage: "sim <message>",
  },
  async onStart({ api, args, event }) {
    const authorHex = Buffer.from(this.config.author).toString('hex');
    if (authorHex !== '5072696e6365') {
      api.sendMessage('Access Denied', event.threadID);
      return;
    }

    const input = args.join(" ");
    if (!input) {
      api.sendMessage(`💬 | Usage: ${this.config.name} <message>`, event.threadID);
      return;
    }

    try {
      const response = await axios.get(`https://daikyu-api.up.railway.app/api/sim-simi?talk=${encodeURIComponent(input)}`);
      const message = response.data.response;
      api.sendMessage(message, event.threadID);
    } catch (error) {
      api.sendMessage("😔 | An error occurred. Please try again later.", event.threadID);
    }
  }
};