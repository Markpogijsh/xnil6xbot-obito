const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// Simple fuzzy search for suggestion
function getClosestCommand(name) {
  const lowerName = name.toLowerCase();
  let closest = null;
  let minDist = Infinity;

  for (const cmdName of commands.keys()) {
    const dist = levenshteinDistance(lowerName, cmdName.toLowerCase());
    if (dist < minDist) {
      minDist = dist;
      closest = cmdName;
    }
  }
  if (minDist <= 3) return closest;
  return null;
}

// Levenshtein distance
function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
}

module.exports = {
  config: {
    name: "help",
    version: "1.24",
    author: "Keijo",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage and list all commands" },
    longDescription: { en: "View command usage and list all commands directly" },
    category: "info",
    guide: { en: "{pn} or {pn} [command]" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const categories = {};

    // Organize commands by category
    for (const [name, cmd] of commands) {
      if (!cmd?.config || typeof cmd.onStart !== "function") continue;
      if (cmd.config.role > role) continue;

      const category = cmd.config.category?.toLowerCase() || "uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    const rawInput = args.join(" ").trim();

    // If no argument, show full help list
    if (!rawInput) {
      let msg = "╔═══ 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 ═══╗\n";
      for (const category of Object.keys(categories).sort()) {
        msg += `\n┍━━━[ ${category.toUpperCase()} ]\n`;
        const sortedNames = categories[category].sort();
        for (const cmdName of sortedNames) msg += `┋〄 ${cmdName}\n`;
        msg += "┕━━━━━━━━━━━━◊\n";
      }
      msg += `\nTotal commands: ${commands.size}\nPrefix: ${prefix}\nOwner: Keijo`;
      return message.reply(msg);
    }

    // If argument provided, show command info
    const commandName = rawInput.toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command?.config) {
      const suggestion = getClosestCommand(commandName);
      if (suggestion) return message.reply(`❌ Command "${commandName}" not found. Did you mean "${suggestion}"?`);
      return message.reply(`❌ Command "${commandName}" not found.\nTry: ${prefix}help`);
    }

    const cfg = command.config;
    const roleText = cfg.role === 0 ? "All users" : cfg.role === 1 ? "Group Admins" : "Bot Admins";
    const usage = cfg.guide?.en?.replace(/{pn}/g, `${prefix}${cfg.name}`) || `${prefix}${cfg.name}`;

    const infoMsg = `
╔══ [COMMAND INFO] ══╗
┋ Name       : ${cfg.name}
┋ Category   : ${cfg.category || "Uncategorized"}
┋ Description: ${cfg.longDescription?.en || "No description"}
┋ Aliases    : ${cfg.aliases?.join(", ") || "None"}
┋ Version    : ${cfg.version || "1.0"}
┋ Permission : ${cfg.role} (${roleText})
┋ Cooldown   : ${cfg.countDown || 5}s
┋ Author     : ${cfg.author || "Unknown"}
┋ Usage      : ${usage}
╚═══════════════════╝`;

    return message.reply(infoMsg);
  },
};