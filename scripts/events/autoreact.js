module.exports = {
  config: {
    name: "autoreact",
    version: "3.7.1",
    author: "Keijo",
    description: "Reacts and replies to messages based on substrings.",
    category: "event",
    role: 0
  },

  onStart: async function () {
    console.log("✅ AutoReact loaded.");
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const text = event.body.toLowerCase();
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // ✅ Emoji Reactions (match substrings)
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
      "burat": ["Si Ari pogi, malake burat 💪", "Tingin ako burat", "Burat means tite diba? tingin nga rate ko lang"],
      "kick": ["Ikaw dapat kinikick eh, wala ka namang ambag.", "ikaw dapat kinikick eh wala ka namang dulot sa pinas putanginamo di ka mahal ng magulang mo bobo ka", "sige ganyan ka naman eh, hindi ka na naawa sakin 😞💔"],
      "hahaha": ["Tawang-tawa ampota, saksakin ko ngalangala mo 🔪", "Tawa ng nirebound ba yan?", "Happy?"],
      "hehehe": ["Hehe parang may tinatago ka lods 😏", "Seryoso ka ba o nang-aasar ka lang? 🤨", "Hehehe cute 😂"],
      "hihihi": ["Inlove ba ito?", "Hihihi ampota", "Nakaka-kilig naman yang hihihi mo 😍"],
      "huhuhu": ["Huhuhu parang si Santa Claus ah 🎅", "gawkgawkgawkgawk", "Iyak ba yan? 🤔"]
    };

    // Pattern-based replies (e.g. hahahehe)
    const patterns = {
      "hahaha": /(ha){2,}/i,
      "hehehe": /(he){2,}/i,
      "hihihi": /(hi){2,}/i,
      "huhuhu": /(hu){2,}/i
    };

    for (const key in patterns) {
      if (patterns[key].test(text)) {
        return message.reply(pick(replies[key]));
      }
    }

    // Emoji-only triggers
    if (text.includes("😂") || text.includes("🤣")) {
      return message.reply(pick(replies["hahaha"]));
    }

    // Substring match replies (no space needed)
    for (let key in replies) {
      if (text.includes(key)) {
        return message.reply(pick(replies[key]));
      }
    }
  }
};