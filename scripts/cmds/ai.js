const axios = require("axios");

module.exports.config = {
  name: "ai",
  aliases: [],
  version: "1.0.4",
  role: 0,
  author: "Keijo (mod by ChatGPT)",
  description: "Random Tagalog AI responses + Daikyu API kapag may tanong",
  usePrefix: false, // walang prefix
  guide: "itype lang: ai [tanong]",
  category: "fun",
  countDown: 1
};

// ✅ Neutral random responses (walang umaga/gabi para hindi mali)
const responses = [
  "Hello, anong maitutulong ko sayo ngayon kaibigan? 🌌",
  "Kamusta ka, nandito ako handang sumagot sa tanong mo ✨",
  "Sabihin mo lang kung ano concern mo 🌺",
  "Sige, handa ako makinig at tumulong sayo ngayon 🔮",
  "Kumusta! Pwede mong itanong sakin kahit anong bagay 🌙",
  "Hello! Anong gusto mong malaman, sagutin natin agad 🌟",
  "Ayos, tara pag-usapan natin kung anong nasa isip mo 🌿",
  "Oks, kwento ka lang at tutulungan kitang magdesisyon ☀️",
  "Sige, ready ako magbigay ng sagot sa tanong mo 🌊",
  "Hello! Nandito ako para sagutin tanong mo kaagad 🌠"
];

function randomReply() {
  return responses[Math.floor(Math.random() * responses.length)];
}

// ✅ Required kahit di ginagamit
module.exports.onStart = async function ({ api, event }) {
  return api.sendMessage("Itype mo lang 'ai' para kausapin ako 🌌", event.threadID, event.messageID);
};

// ✅ Auto-trigger kapag may nag type ng "ai"
module.exports.onChat = async function ({ api, event }) {
  const body = (event.body || "").trim();

  // kapag eksaktong "ai" lang → random reply
  if (body.toLowerCase() === "ai") {
    const msg = randomReply();
    return api.sendMessage(msg, event.threadID, event.messageID);
  }

  // kapag may tanong → AI generate gamit Daikyu API
  if (body.toLowerCase().startsWith("ai ")) {
    const query = body.slice(3).trim();

    if (!query) {
      return api.sendMessage("❌ Lagay ka ng tanong mo pagkatapos ng 'ai'", event.threadID, event.messageID);
    }

    try {
      const url = `https://daikyu-api.up.railway.app/api/o3-mini?prompt=${encodeURIComponent(query)}&uid=${event.senderID}`;
      const res = await axios.get(url);

      const answer = res.data.response || "❌ Walang naisagot si AI.";
      return api.sendMessage(answer, event.threadID, event.messageID);
    } catch (err) {
      console.error("❌ AI Error:", err.message);
      return api.sendMessage("❌ Nagka-error sa pagkuha ng sagot mula sa Daikyu API.", event.threadID, event.messageID);
    }
  }
};