const axios = require("axios");

function humanizeText(text) {
  const emojis = ["😂", "😅", "☹️", "🤔", "😎", "😊", "🥲", "😉", "😮", "🙃"];
  let words = text.split(" ");

  // random spacing + capitalization
  words = words.map(word => {
    let newWord = "";
    for (let char of word) {
      // random uppercase
      if (/[a-zA-Z]/.test(char) && Math.random() < 0.3) {
        newWord += char.toUpperCase();
      } else {
        newWord += char;
      }
    }

    // insert random space in middle of some words
    if (newWord.length > 2 && Math.random() < 0.25) {
      const mid = Math.floor(newWord.length / 2);
      newWord = newWord.slice(0, mid) + " " + newWord.slice(mid);
    }

    return newWord;
  });

  let humanized = words.join(" ");

  // random emoji insertions
  if (Math.random() < 0.6) {
    humanized += " " + emojis[Math.floor(Math.random() * emojis.length)];
  }
  if (Math.random() < 0.3) {
    const pos = Math.floor(Math.random() * humanized.length);
    humanized =
      humanized.slice(0, pos) +
      " " +
      emojis[Math.floor(Math.random() * emojis.length)] +
      " " +
      humanized.slice(pos);
  }

  return humanized;
}

module.exports = {
  config: {
    name: "ai",
    version: "1.4",
    author: "Keijo",
    countDown: 3,
    role: 0,
    description:
      "Chat with AI (Aria API with GPT fallback, human-like response: typos + emojis + random capitalization)",
    category: "fun",
    guide: {
      en: "Just type 'ai <your question>' or 'gpt <your question>' (no prefix needed).",
      vi: "Chỉ cần gõ 'ai <câu hỏi>' hoặc 'gpt <câu hỏi>' (không cần prefix)."
    }
  },

  langs: {
    en: {
      noQuestion: "💡 PlE ase prov Ide a quesTion fiRst ☹️",
      error: "❌ So Rry, some thing weNt wrong. Pls try agAin lat er 😂"
    },
    vi: {
      noQuestion: "❌ Vui lÒng nhậP câU hỏI trưỚc 😅",
      error: "❌ Xin lỗi, có lỗi xẢy ra. Vui lÒng thỬ lạI sau 🤔"
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event, message, getLang }) {
    if (!event.body) return;

    const content = event.body.trim();
    const lower = content.toLowerCase();

    // Triggers: ai, AI, Ai, gpt
    if (!(lower.startsWith("ai") || lower.startsWith("gpt"))) return;

    // Extract prompt (remove trigger word)
    let prompt = "";
    if (lower.startsWith("ai")) {
      prompt = content.slice(2).trim();
    } else if (lower.startsWith("gpt")) {
      prompt = content.slice(3).trim();
    }

    if (!prompt) {
      return message.reply(getLang("noQuestion"));
    }

    // Send loading msg
    api.sendMessage("⌛ Loa dinG AI reS ponse...", event.threadID, async (err, info) => {
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
          const humanized = humanizeText(data.response);
          return api.editMessage(humanized, info.messageID, event.threadID);
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
            const humanized = humanizeText(res.data.response);
            return api.editMessage(humanized, info.messageID, event.threadID);
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