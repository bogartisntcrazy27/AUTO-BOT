const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "sendnoti",
  version: "1.1.0",
  role: 2,
  description: "Sends a message to all groups and can only be done by the admin.",
  hasPrefix: false,
  aliases: ["noti"],
  usages: "[Text]",
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args, admin }) {
  if (!admin.includes(event.senderID))
   return api.sendMessage("This Command is only for AUTOBOT ADMIN", event.threadID, event.messageID);
  const threadList = await api.getThreadList(100, null, ["INBOX"]);
  let sentCount = 0;
  const custom = args.join(" ");

  async function sendMessage(thread) {
    try {
      await api.sendMessage(
`➜ 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗙𝗥𝗢𝗠 𝗔𝗗𝗠𝗜𝗡\n▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱\n➜ ${custom}`,
        thread.threadID
      );
      sentCount++;
    } catch (error) {
      console.error("Error sending a message:", error);
    }
  }

  for (const thread of threadList) {
    if (sentCount >= 20) {
      break;
    }
    if (thread.isGroup && thread.name != thread.threadID && thread.threadID != event.threadID) {
      await sendMessage(thread);
    }
  }

  if (sentCount > 0) {
    api.sendMessage(`› Sent the notification successfully.`, event.threadID);
  } else {
    api.sendMessage(
      "› No eligible group threads found to send the message to.",
      event.threadID
    );
  }
};