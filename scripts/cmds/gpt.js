const axios = require("axios");

// ---- HUMANIZER ----

// Add random spaces in words (typo-like)
function addSpaces(text) {
  return text
    .split(" ")
    .map(word => {
      if (Math.random() < 0.25 && word.length > 3) {
        const pos = Math.floor(Math.random() * (word.length - 2)) + 1;
        return word.slice(0, pos) + " " + word.slice(pos);
      }
      return word;
    })
    .join(" ");
}

// Add contextual emojis
function addEmojis(text) {
  let out = text;

  if (/\?$/.test(out) || /(paano|bakit|ano|saan)/i.test(out)) out += " 🤔";
  if (/(haha|lol|joke|funny|tawa)/i.test(out)) out += " 😂";
  if (/(salamat|thanks|thank you)/i.test(out)) out += " 🙏";
  if (/(lungkot|sad|awa|wala)/i.test(out)) out += " ☹️";
  if (/(saya|happy|buti|ayos|okay)/i.test(out)) out += " ☺️";
  if (/(wow|amazing|galing|astig)/i.test(out)) out += " ✨";

  // Random filler emoji
  if (Math.random() < 0.3) {
    const random = ["😅", "☺️", "😂", "🤔", "✨"];
    out += " " + random[Math.floor(Math.random() * random.length)];
  }

  return out;
}

// Apply both
function humanize(text) {
  return addEmojis(addSpaces(text));
}

// ---- TYPE LIKE HUMAN ----
async function simulateTyping(api, threadID, msgID, fullText) {
  let display = "";
  const words = fullText.split(" ");

  for (const word of words) {
    display += word + " ";
    await new Promise(r => setTimeout(r, 350 + Math.random() * 250)); // delay kada salita
    try {
      await api.editMessage(display.trim() + "▌", msgID, threadID); // may cursor effect
    } catch (e) {}
  }

  // Final clean output
  await api.editMessage(fullText, msgID, threadID);
}

module.exports = {
  config: {
    name: "ai",
    version: "1.2",
    author: "Keijo",
    countDown: 3,
    role: 0,
    description: "AI assistant with Aria API (with GPT fallback), human-like typing + emojis",
    category: "fun",
    guide: {
      en: "Just type 'ai <your question>' (no prefix needed).",
      vi: "Chỉ cần gõ 'ai <câu hỏi>' (không cần prefix)."
    }
  },

  langs: {
    en: {
      noQuestion: "Please provide a question first.",
      error: "❌ Sorry, something went wrong. Please try again later."
    },
    vi: {
      noQuestion: "Vui lòng nhập câu hỏi trước.",
      error: "❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event, message, getLang }) {
    if (!event.body) return;

    const content = event.body.trim();
    const lower = content.toLowerCase();

    // Check if starts with "ai"
    if (!lower.startsWith("ai")) return;

    const prompt = content.slice(2).trim();
    if (!prompt) return message.reply(getLang("noQuestion"));

    api.sendMessage("⌛ Lo ading AI res ponse...", event.threadID, async (err, info) => {
      if (err) return;

      try {
        // MAIN API → Aria
        const { data } = await axios.get(
          "https://betadash-api-swordslush-production.up.railway.app/Aria",
          { params: { ask: prompt, userid: "61579032975023", stream: "hatdog" } }
        );

        if (data.status === "200" && data.response) {
          const reply = humanize(data.response);
          return simulateTyping(api, event.threadID, info.messageID, reply);
        } else {
          throw new Error("Aria returned invalid response");
        }
      } catch (err) {
        console.error("Aria API error:", err.message);

        // FALLBACK → GPT
        try {
          const url = `https://urangkapolka.vercel.app/api/chatgpt4?prompt=${encodeURIComponent(prompt)}`;
          const res = await axios.get(url);

          if (res.data && res.data.response) {
            const reply = humanize(res.data.response);
            return simulateTyping(api, event.threadID, info.messageID, reply);
          } else {
            throw new Error("GPT no response");
          }
        } catch (backupErr) {
          console.error("GPT API error:", backupErr.message);
          return api.editMessage(getLang("error"), info.messageID, event.threadID);
        }
      }
    });
  }
};