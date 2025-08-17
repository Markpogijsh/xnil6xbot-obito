const axios = require("axios");

module.exports.config = {
  name: "ai",
  aliases: ["gpt", "chat"],
  version: "1.0.3",
  role: 0,
  author: "dipto (mod by keijk)",
  description: "AI chatbot powered by daikyu-api (o3-mini)",
  usePrefix: false, // para hindi na kailangan ng "."
  category: "Ai",
  countDown: 3,
};

// kapag nireplyan yung message ng bot → automatic tuloy usapan
module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.author != event.senderID) return;

  try {
    const prompt = event.body.trim();
    const url = `https://daikyu-api.up.railway.app/api/o3-mini?prompt=${encodeURIComponent(
      prompt
    )}&uid=${event.senderID}`;

    const response = await axios.get(url);
    const reply = response.data.response;

    await api.sendMessage(
      reply,
      event.threadID,
      (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
        });
      },
      event.messageID
    );
  } catch (e) {
    console.error("❌ Error onReply:", e.message);
    api.sendMessage("⚠️ Error: " + e.message, event.threadID, event.messageID);
  }
};

// kapag nagsend ng "ai ..." → automatic trigger
module.exports.onChat = async function ({ api, event }) {
  if (event.senderID == api.getCurrentUserID()) return;

  const message = event.body?.trim();
  if (!message) return;

  // ✅ check kung nagsisimula sa "ai " (kahit uppercase AI)
  if (!/^ai\s+/i.test(message)) return;

  try {
    const input = message.replace(/^ai\s+/i, ""); // tanggalin yung "ai " prefix
    if (!input) return api.sendMessage("⚠️ Please provide a question after 'ai'", event.threadID, event.messageID);

    const url = `https://daikyu-api.up.railway.app/api/o3-mini?prompt=${encodeURIComponent(
      input
    )}&uid=${event.senderID}`;

    const response = await axios.get(url);
    const reply = response.data.response;

    await api.sendMessage(
      reply,
      event.threadID,
      (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
        });
      },
      event.messageID
    );
  } catch (e) {
    console.error("❌ Error onChat:", e.message);
    api.sendMessage("⚠️ Error: " + e.message, event.threadID, event.messageID);
  }
};