const config = {
  name: "menu",
  aliases: ["help"],
  description: "Show all available bot commands in stylish design",
  usage: "[page/all]",
  cooldown: 3,
  permissions: [0],
  credits: "Keijo"
};

async function onStart({ message }) {
  const allCommands = Array.from(global.GoatBot.commands.values());
  const commandNames = allCommands.map(cmd => `.${cmd.config.name}`).join("\n");

  const design = `
❯ 𝗵𝗶𝗹𝗹𝗼𝘄 nigaownirsv2
━━━━━━━━━━━━━━━

${commandNames}

➥ 𝖳𝗋𝗒 𝗍𝗈 𝙀𝙭𝙥𝙡𝙤𝙧𝙚 𝗆𝗈𝗋𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌!
➥ 𝖵𝗂𝖾𝗐 𝖠𝖫𝖫 𝖢𝖮𝖬𝖬𝖠𝖭𝖣𝖲: .𝗺𝗲𝗻𝘂 𝗮𝗹𝗹
➥ 𝖵𝗂𝖾𝗐 𝖻𝗒 𝗉𝖺𝗀𝖾: .𝗺𝗲𝗻𝘂 <𝗽𝗮𝗴𝗲>
➥ 𝖵𝗂𝖾𝗐 𝖻𝖺𝗌𝗂𝖼𝗌: .𝗺𝗲𝗻𝘂 𝗯𝗮𝘀𝗶𝗰𝘀

✦ 𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝖽 𝖻𝗒 @Keijo 🎀
━━━━━━━ ✕ ━━━━━━`;

  return message.reply(design);
}

module.exports = {
  config,
  onStart
};