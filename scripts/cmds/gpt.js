const axios = require("axios");

let typoCounter = 0; // bilang ng typo responses

function addTypos(text) {
  // typo patterns (palit ng ilang letters)
  const typoMap = {
    a: ["s", "q"],
    e: ["r", "w"],
    i: ["o", "u"],
    o: ["i", "p"],
    u: ["i", "y"],
    t: ["r", "y"],
    n: ["m", "b"],
    m: ["n"],
    g: ["h", "f"]
  };

  let chars = text.split("");
  let typoCount = Math.floor(Math.random() * 3) + 1; // 1–3 typos per response

  for (let i = 0; i < typoCount; i++) {
    let idx = Math.floor(Math.random() * chars.length);
    let char = chars[idx].toLowerCase();
    if (typoMap[char]) {
      let replacements = typoMap[char];
      chars[idx] = replacements[Math.floor(Math.random() * replacements.length)];
    }
  }

  return chars.join("");
}

function humanizeText(text) {
  typoCounter++;

  // bawat ika-4 na message → walang typo
  if (typoCounter >= 4) {
    typoCounter = 0;
    return text;
  }

  return addTypos(text);
}

module.exports = {
  config: {
    name: "ai",
    version: "1.5",
    author: "Keijo",
    countDown: 3,
    role: 0,
    description:
      "Chat with AI (Aria API with GPT fallback, human-like response: controlled typos + emojis)",
    category: "fun",
    guide: {
      en: "Just type 'ai <your question>' or 'gpt <your question>' (no prefix needed).",
      vi: "Chỉ cần gõ 'ai <câu hỏi>' hoặc 'gpt <câu hỏi>' (không cần prefix)."
    }
  },

  langs: {
    en: {
      noQuestion: "💡 Please provide a question first!",
      error: "❌ Sorry, something went wrong. Please try again later 😂"
    },
    vi: {
      noQuestion: "❌ Vui lòng nhập câu hỏi trước 😅",
      error: "❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau 🤔"
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
    api.sendMessage("⏳ Loading AI response...", event.threadID, async (err, info) => {
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