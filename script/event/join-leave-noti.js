const path = require("path");
const fs = require("fs");
const axios = require("axios");

module.exports.config = {
    name: "join-leave-noti",
    version: "1.0.0",
};

module.exports.handleEvent = async function({ api, event, prefix }) {
    try {
        if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const threadID = event.threadID;
            const addedParticipants = event.logMessageData.addedParticipants;

            if (addedParticipants.some(participant => participant.userFbId === api.getCurrentUserID())) {
                const botNickname = "AutoBot";
                await api.changeNickname(botNickname, threadID, api.getCurrentUserID());

                await api.sendMessage(
                    `AUTOBOT CONNECTED!\n\n❑ Prefix: ${prefix}\nThank you for using this bot, have fun using it.`,
                    threadID,
                );
            } else {
                const newParticipantID = addedParticipants[0].userFbId;
                const threadInfo = await api.getThreadInfo(threadID);
                const userInfo = await api.getUserInfo(newParticipantID);
                const name = userInfo[newParticipantID].name;
                const memberCount = threadInfo.participantIDs.length;

                const welcomeMessage = `Hello, ${name},\nWelcome to ${threadInfo.threadName}.\nYou are the ${memberCount}th member of our community; please enjoy! 🥳🤍`;

                await api.sendMessage(welcomeMessage, threadID);
            }
        }

        if (event.type === "event" && event.logMessageType === "log:unsubscribe") {
            const threadID = event.threadID;
            const leftParticipantID = event.logMessageData.leftParticipantFbId;
            const adminID = event.author;

            const userInfo = await api.getUserInfo(leftParticipantID);
            const userName = userInfo[leftParticipantID]?.name || 'Unknown User';
            const threadInfo = await api.getThreadInfo(threadID);

            let leaveMessage;

            if (adminID === leftParticipantID) {
                leaveMessage = `${userName} has left the ${threadInfo.threadName}. Goodbye! 👋`;
            } else {
                leaveMessage = `${userName} was kicked for violating the group rules.😓`;
            }

            api.sendMessage(leaveMessage, threadID);
        }
    } catch (error) {
        console.error("Error in handleEvent: ", error);
    }
};