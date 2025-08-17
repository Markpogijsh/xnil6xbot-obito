const axios = require("axios");

module.exports.config = {
  name: "ai",
  aliases: [],
  version: "1.0.1",
  role: 0,
  author: "dipto (mod by ChatGPT)",
  description: "AI chatbot powered by daikyu-api (o3-mini)",
  usePrefix: true,
  guide: "[message]",
  category: "Ai",
  countDown: 5,
};

module.exports.onReply = async function ({ api, event, Reply }) {
  const { author } = Reply;
  if (author != event.senderID) return;

  if (event.type == "message_reply") {
    const reply = event.body.toLowerCase();
    if (isNaN(reply)) {
      try {
        const url = `https://daikyu-api.up.railway.app/api/o3-mini?prompt=${encodeURIComponent(
          reply
        )}&uid=${author}`;

        console.log("➡️ Fetching (onReply):", url); // DEBUG LOG

        const response = await axios.get(url);
        const ok = response.data.response;

        await api.sendMessage(
          ok,
          event.threadID,
          (errr, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              link: ok,
            });
          },
          event.messageID
        );
      } catch (error) {
        console.log("❌ Error in onReply:", error.message);
        api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
      }
    }
  }
};

module.exports.onStart = async function ({ api, args, event }) {
  try {
    const author = event.senderID;
    const input = args.join(" ");
    if (!args[0]) {
      return api.sendMessage(
        "Please provide a question to answer\n\nExample:\n.ai hey",
        event.threadID,
        event.messageID
      );
    }

    const url = `https://daikyu-api.up.railway.app/api/o3-mini?prompt=${encodeURIComponent(
      input
    )}&uid=${author}`;

    console.log("➡️ Fetching (onStart):", url); // DEBUG LOG

    const response = await axios.get(url);
    const mg = response.data.response;

    await api.sendMessage(
      { body: mg },
      event.threadID,
      (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author,
          link: mg,
        });
      },
      event.messageID
    );
  } catch (error) {
    console.log("❌ Failed to get an answer:", error.message);
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};