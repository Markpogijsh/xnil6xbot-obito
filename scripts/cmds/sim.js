const axios = require("axios");

module.exports.config = {
  name: "sim",
  aliases: ["simsimi", "talk"],
  version: "1.0.2",
  role: 0,
  author: "Keijo (mod by ChatGPT)",
  description: "Talk with a SimSimi-like AI",
  usePrefix: false, // ✅ no need prefix
  guide: "[message]",
  category: "Ai",
  countDown: 3,
};

// ✅ normal command start
module.exports.onStart = async function ({ api, event, args }) {
  const input = args.join(" ").trim();
  if (!input) {
    return api.sendMessage("❌ Please say something to Sim!", event.threadID, event.messageID);
  }

  try {
    const res = await axios.get(
      `https://daikyu-api.up.railway.app/api/sim-simi?talk=${encodeURIComponent(input)}`
    );
    const reply = res.data.response || "❌ No response from Sim.";

    api.sendMessage(
      reply,
      event.threadID,
      (err, info) => {
        if (!err) {
          // ✅ store reply session (Sim will respond if this message gets a reply)
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            author: event.senderID,
            isSim: true, // tag as sim message
          });
        }
      },
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Failed to get a response from Sim.", event.threadID, event.messageID);
  }
};

// ✅ reply handler (kahit anong sagot mo kay Sim, gagana)
module.exports.onReply = async function ({ api, event, Reply }) {
  // check if this is a reply to Sim
  if (!Reply.isSim) return;

  const input = event.body;
  if (!input) return;

  try {
    const res = await axios.get(
      `https://daikyu-api.up.railway.app/api/sim-simi?talk=${encodeURIComponent(input)}`
    );
    const reply = res.data.response || "❌ No response from Sim.";

    api.sendMessage(
      reply,
      event.threadID,
      (err, info) => {
        if (!err) {
          // continue conversation
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            author: event.senderID,
            isSim: true,
          });
        }
      },
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Failed to get a response from Sim.", event.threadID, event.messageID);
  }
};

// ✅ non-prefix trigger ("sim hello")
module.exports.onChat = async function ({ api, event }) {
  const body = event.body;
  if (!body) return;

  const lower = body.toLowerCase();
  if (lower === "sim" || lower.startsWith("sim ")) {
    const input = body.slice(3).trim();
    if (!input) {
      return api.sendMessage("❌ Please say something to Sim!", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(
        `https://daikyu-api.up.railway.app/api/sim-simi?talk=${encodeURIComponent(input)}`
      );
      const reply = res.data.response || "❌ No response from Sim.";

      api.sendMessage(
        reply,
        event.threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              author: event.senderID,
              isSim: true, // tag message as from Sim
            });
          }
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to get a response from Sim.", event.threadID, event.messageID);
    }
  }
};