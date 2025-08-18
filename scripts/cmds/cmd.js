const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
    const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    config: {
        name: "cmd",
        version: "1.17",
        author: "NTKhang",
        countDown: 5,
        role: 3,
        admin: ["61579032975023", "61579032975023"], // <-- admin array
        description: {
            vi: "Quản lý các tệp lệnh của bạn",
            en: "Manage your command files"
        },
        category: "owner",
        guide: {
            vi: "   {pn} load <tên file lệnh>\n   {pn} loadAll\n   {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ một url",
            en: "   {pn} load <command file name>\n   {pn} loadAll\n   {pn} install <url> <command file name>: Download and install a command file from a url"
        }
    },

    langs: {
        vi: {
            missingFileName: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn reload",
            loaded: "✅ | Đã load command \"%1\" thành công",
            loadedError: "❌ | Load command \"%1\" thất bại với lỗi\n%2: %3",
            loadedSuccess: "✅ | Đã load thành công (%1) command",
            loadedFail: "❌ | Load thất bại (%1) command\n%2",
            openConsoleToSeeError: "👀 | Hãy mở console để xem chi tiết lỗi",
            missingCommandNameUnload: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn unload",
            unloaded: "✅ | Đã unload command \"%1\" thành công",
            unloadedError: "❌ | Unload command \"%1\" thất bại với lỗi\n%2: %3",
            missingUrlCodeOrFileName: "⚠️ | Vui lòng nhập vào url hoặc code và tên file lệnh bạn muốn cài đặt",
            missingUrlOrCode: "⚠️ | Vui lòng nhập vào url hoặc code của tệp lệnh bạn muốn cài đặt",
            missingFileNameInstall: "⚠️ | Vui lòng nhập vào tên file để lưu lệnh (đuôi .js)",
            invalidUrl: "⚠️ | Vui lòng nhập vào url hợp lệ",
            invalidUrlOrCode: "⚠️ | Không thể lấy được mã lệnh",
            alreadExist: "⚠️ | File lệnh đã tồn tại, bạn có chắc chắn muốn ghi đè lên file lệnh cũ không?\nThả cảm xúc bất kì vào tin nhắn này để tiếp tục",
            installed: "✅ | Đã cài đặt command \"%1\" thành công, file lệnh được lưu tại %2",
            installedError: "❌ | Cài đặt command \"%1\" thất bại với lỗi\n%2: %3",
            missingFile: "⚠️ | Không tìm thấy tệp lệnh \"%1\"",
            invalidFileName: "⚠️ | Tên tệp lệnh không hợp lệ",
            unloadedFile: "✅ | Đã unload lệnh \"%1\""
        },
        en: {
            missingFileName: "⚠️ | Please enter the command name you want to reload",
            loaded: "✅ | Loaded command \"%1\" successfully",
            loadedError: "❌ | Failed to load command \"%1\" with error\n%2: %3",
            loadedSuccess: "✅ | Loaded successfully (%1) command",
            loadedFail: "❌ | Failed to load (%1) command\n%2",
            openConsoleToSeeError: "👀 | Open console to see error details",
            missingCommandNameUnload: "⚠️ | Please enter the command name you want to unload",
            unloaded: "✅ | Unloaded command \"%1\" successfully",
            unloadedError: "❌ | Failed to unload command \"%1\" with error\n%2: %3",
            missingUrlCodeOrFileName: "⚠️ | Please enter the url or code and command file name you want to install",
            missingUrlOrCode: "⚠️ | Please enter the url or code of the command file you want to install",
            missingFileNameInstall: "⚠️ | Please enter the file name to save the command (with .js extension)",
            invalidUrl: "⚠️ | Please enter a valid url",
            invalidUrlOrCode: "⚠️ | Unable to get command code",
            alreadExist: "⚠️ | The command file already exists, are you sure you want to overwrite the old command file?\nReact to this message to continue",
            installed: "✅ | Installed command \"%1\" successfully, the command file is saved at %2",
            installedError: "❌ | Failed to install command \"%1\" with error\n%2: %3",
            missingFile: "⚠️ | Command file \"%1\" not found",
            invalidFileName: "⚠️ | Invalid command file name",
            unloadedFile: "✅ | Unloaded command \"%1\""
        }
    },

    onStart: async ({ args, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, commandName, getLang }) => {
        // Admin check
        if (!module.exports.config.admin.includes(event.senderID)) {
            return message.reply("❌ You are not an admin!");
        }

        const { unloadScripts, loadScripts } = global.utils;

        if (args[0] == "load" && args.length == 2) {
            if (!args[1])
                return message.reply(getLang("missingFileName"));
            const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
            if (infoLoad.status == "success")
                message.reply(getLang("loaded", infoLoad.name));
            else {
                message.reply(
                    getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)
                    + "\n" + infoLoad.error.stack
                );
                console.log(infoLoad.errorWithThoutRemoveHomeDir);
            }
        }
        // …dito mo ipagpapatuloy lahat ng existing onStart logic tulad ng loadAll, unload, install, etc.
    },

    onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
        const { loadScripts } = global.utils;
        const { author, data: { fileName, rawCode } } = Reaction;
        if (event.userID != author)
            return;
        const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
        infoLoad.status == "success" ?
            message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
            message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
    }
};

// do not edit this code because it use for obfuscate code
const packageAlready = [];
const spinner = "\\|/-";
let count = 0;

// …dito mo ilalagay ang loadScripts function at lahat ng natitirang logic ng iyong command