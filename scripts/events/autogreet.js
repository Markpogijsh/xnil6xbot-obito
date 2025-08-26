const axios = require("axios");

module.exports.config = {
  name: "autogreet",
  eventType: ["message"],
  version: "1.0.1",
  author: "Keijo + ChatGPT",
  description: "Auto greet at 6AM, 12PM, 6PM + reply with Sim",
  category: "event"
};

let greetedToday = {
  "6am": false,
  "12pm": false,
  "6pm": false
};

function getTimeNow() {
  const date = new Date();
  return {
    h: date.getHours(),
    m: date.getMinutes()
  };
}

async function sendSimResponse(api, event, input) {
  try {
    const res = await axios.get(
      `https://daikyu-api.up.railway.app/api/sim-simi?talk=${encodeURIComponent(input)}`
    );
    const reply = res.data.response || "Hmm... 🤔";
    api.sendMessage(
      reply,
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "sim-reply",
          author: event.senderID
        });
      },
      event.messageID
    );
  } catch (err) {
    console.error("Sim error:", err.message);
  }
}

// required by GoatBot (kahit empty ok lang)
module.exports.onStart = function () {};

module.exports.onLoad = function () {
  // reset greetings every midnight
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      greetedToday = { "6am": false, "12pm": false, "6pm": false };
    }
  }, 60 * 1000);
};

module.exports.onMessage = async function ({ api, event }) {
  const { h, m } = getTimeNow();

  // 6:00 AM greet
  if (h === 6 && m === 0 && !greetedToday["6am"]) {
    greetedToday["6am"] = true;
    return api.sendMessage(
      "🌅 Hello it's already 6:00AM, good morning everyone! Breakfast na 🍳☕",
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "sim-reply",
          author: event.senderID
        });
      }
    );
  }

  // 12:00 PM greet
  if (h === 12 && m === 0 && !greetedToday["12pm"]) {
    greetedToday["12pm"] = true;
    return api.sendMessage(
      "☀️ It's 12:00PM, good noon! Let's have lunch 🍽️",
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "sim-reply",
          author: event.senderID
        });
      }
    );
  }

  // 6:00 PM greet
  if (h === 18 && m === 0 && !greetedToday["6pm"]) {
    greetedToday["6pm"] = true;
    return api.sendMessage(
      "🌇 Good evening everyone! It's 6:00PM, dinner time 🍛",
      event.threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "sim-reply",
          author: event.senderID
        });
      }
    );
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.type === "sim-reply") {
    const input = event.body || "";
    if (input.trim() !== "") {
      await sendSimResponse(api, event, input);
    }
  }
};