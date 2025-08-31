const axios = require('axios');

// Store message IDs for Sim triggers (autoreact + sim replies)
const simTriggerMessages = new Set();

module.exports = {
  config: {
    name: "autoreact",
    version: "5.0.0",
    author: "Keijo + Sim Chain v2",
    description: "Auto reacts, replies, and Sim responds to any reply recursively.",
    category: "event",
    role: 0
  },

  onStart: async function () {
    console.log("✅ AutoReact + SimSimi Reply Chain loaded.");
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;

    const text = event.body.toLowerCase();
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // ✅ Check if replying to a Sim-trigger message
    const repliedTo = event.messageReply?.messageID;
    if (repliedTo && simTriggerMessages.has(repliedTo)) {
      const input = event.body.trim();
      if (!input) return;

      try {
        const res = await axios.get(`https://daikyu-api.up.railway.app/api/sim-simi?talk=${encodeURIComponent(input)}`);
        const reply = res.data.response || "❌ No response from Sim.";
        const sent = await message.reply(reply);

        // Track this Sim reply too for further replies
        simTriggerMessages.add(sent.messageID);
        return;
      } catch (err) {
        console.error(err);
        return message.reply("❌ Failed to get a response from Sim.");
      }
    }

    // ✅ Emoji Reactions
    const reactions = [
      {
        keywords: ["lol", "😂", "ughh", "pagal", "mental", "oye", "love", "jani", "bc", "busy", "group", "kis", "kuta", "jan", "oh", "lor"],
        emojis: ["😆", "🤣", "😂"]
      },
      {
        keywords: ["death", "mar", "udas", "☹️", "hurt", "please", "pls", "😢", "😔", "🥺", "sad"],
        emojis: ["😢", "😭", "🥀"]
      },
      {
        keywords: ["🥵", "umah", "💋", "kiss", "babu", "baby", "wow", "wah", "relationship", "gf", "omg"],
        emojis: ["😘", "😍", "😚"]
      }
    ];

    for (let r of reactions) {
      if (r.keywords.some(word => text.includes(word))) {
        return api.setMessageReaction(pick(r.emojis), event.messageID, () => {}, true);
      }
    }

    // ✅ Auto replies
    const replies = {
      "tite": ["Tite ka nang tite, lika dito subuin mo ’to. 🤣", "Puro ka tite, wala nabang ibang laman yang utak mo?", "Bad yan."],
      "umay": ["Umay talaga, wala kang tatay eh 😏", "Ril", "Umay sayo lods 😓"],
      "bot": ["Oo na, bot na kinginamo ka", "Tama na kaka-bot punyeta", "Pwede tama na kaka-bot nakakarindi na eh!! 😠"],
      "robot": ["Sino tinatawag mong robot ha? 🤨", "ANOOOOOOO!!?", "Robot? 🫤"],
      "burat": ["Si Keijo pogi, malake burat 💪", "Tingin ako burat", "Burat means tite diba? tingin nga rate ko lang"],
      "kick": ["Ikaw dapat kinikick eh, wala ka namang ambag.", "ikaw dapat kinikick eh wala ka namang dulot sa pinas putanginamo di ka mahal ng magulang mo bobo ka", "sige ganyan ka naman eh, hindi ka na naawa sakin 😞💔"],
      "hahaha": ["Tawang-tawa ampota, saksakin ko ngalangala mo 🔪", "Tawa ng nirebound ba yan?", "Happy?"],
      "hehehe": ["Hehe parang may tinatago ka lods 😏", "Seryoso ka ba o nang-aasar ka lang? 🤨", "Hehehe cute 😂"],
      "hihihi": ["Inlove ba ito?", "Hihihi ampota", "Nakaka-kilig naman yang hihihi mo 😍"],
      "huhuhu": ["Huhuhu parang si Santa Claus ah 🎅", "gawkgawkgawkgawk", "Iyak ba yan? 🤔"]
    };

    const patterns = {
      "hahaha": /(ha){2,}/i,
      "hehehe": /(he){2,}/i,
      "hihihi": /(hi){2,}/i,
      "huhuhu": /(hu){2,}/i
    };

    for (const key in patterns) {
      if (patterns[key].test(text)) {
        const replyMsg = pick(replies[key]);
        const sent = await message.reply(replyMsg);
        simTriggerMessages.add(sent.messageID);
        return;
      }
    }

    // Emoji-only triggers
    if (text.includes("😂") || text.includes("🤣")) {
      const sent = await message.reply(pick(replies["hahaha"]));
      simTriggerMessages.add(sent.messageID);
      return;
    }

    // Substring match replies
    for (let key in replies) {
      if (text.includes(key)) {
        const sent = await message.reply(pick(replies[key]));
        simTriggerMessages.add(sent.messageID);
        return;
      }
    }
  }
};