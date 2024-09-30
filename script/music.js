const path = require('path');
module.exports.config = {
  name: "music",
  version: "2.0.6",
  role: 0,
  hasPrefix: false,
  aliases: ['sc', 'sing'],
  usage: 'Soundcloud [song title]',
  description: 'Play a song from SoundCloud',
  credits: 'Kaizenji',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const search = args.join(' ');

  if (!search) {
    api.sendMessage("Please provide a song title.", event.threadID, event.messageID);
    return;
  }

  try {
    api.sendMessage(`Searching for "${search}"...`, event.threadID, event.messageID);

    const soundCloudTrackUrl = `https://cprojectapisjonellv2.adaptable.app/api/soundcloud?search=${encodeURIComponent(search)}`;
    const trackResponse = await axios.get(soundCloudTrackUrl, {
      responseType: 'arraybuffer'
    });

    const cacheDir = path.join(__dirname, 'cache');
    const fileName = `${Date.now()}.mp3`;
    const filePath = path.join(cacheDir, fileName);

    fs.ensureDirSync(cacheDir);
    fs.writeFileSync(filePath, Buffer.from(trackResponse.data));

    if (fs.statSync(filePath).size > 26214400) { // File size limit of 25MB
      fs.unlinkSync(filePath);
      return api.sendMessage('The file could not be sent because it is larger than 25MB.', event.threadID);
    }

    const message = {
      body: `Here is your music from SoundCloud`,
      attachment: fs.createReadStream(filePath)
    };

    api.sendMessage(message, event.threadID, () => {
      fs.unlinkSync(filePath);
    }, event.messageID);

  } catch (error) {
    api.sendMessage('An error occurred while processing the command.', event.threadID, event.messageID);
  }
};