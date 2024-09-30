const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const MAX_FILE_SIZE_MB = 84;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

module.exports.config = {
  name: "autodl",
  version: "2.0.0",
  role: 0,
  hasPrefix: false,
  credits: "Kaizenji",
  description: "Auto video downloader for Instagram, Facebook, TikTok",
  usages: "Automatically detects and downloads video links.",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  const url = this.checkLink(body);
  if (url) {
    api.setMessageReaction("📥", event.messageID, () => {}, true);
    const time = Date.now();
    const filePath = path.join(__dirname, `/cache/${time}.mp4`);
    if (url.match(/instagram\.com/)) {
      await this.downloadInstagram(url, api, event, filePath);
    } else if (url.match(/(facebook\.com|fb\.watch)/)) {
      await this.downloadFacebook(url, api, event, filePath);
    } else if (url.match(/tiktok\.com/)) {
      await this.downloadTikTok(url, api, event, filePath);
    } else {
      api.sendMessage("Unsupported platform.", threadID, messageID);
    }
  }
};

module.exports.downloadInstagram = async function (url, api, event, filePath) {
  try {
    const res = await axios.get(`https://kaizenji-autodl-api.gleeze.com/media?url=${encodeURIComponent(url)}`);
    const videoUrl = res.data.videoUrl;
    if (videoUrl) {
      const response = await axios({ method: "GET", url: videoUrl, responseType: "arraybuffer" });
      if (response.data.length > MAX_FILE_SIZE_BYTES) {
        return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      }
      fs.writeFileSync(filePath, Buffer.from(response.data));
      const messageBody = `✅ Downloaded Successfully`;
      api.sendMessage({ body: messageBody, attachment: fs.createReadStream(filePath) }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    } else {
      api.sendMessage("No video found.", event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("Sorry, an error occurred while downloading from Instagram.", event.threadID, event.messageID);
  }
};

module.exports.downloadFacebook = async function (url, api, event, filePath) {
  try {
    const res = await axios.get(`https://kaizenji-autodl-api.gleeze.com/media?url=${encodeURIComponent(url)}`);
    if (res.data && (res.data.hdUrl || res.data.sdUrl)) {
      const videoUrl = res.data.hdUrl || res.data.sdUrl;
      const response = await axios({ method: "GET", url: videoUrl, responseType: "stream" });
      if (response.headers['content-length'] > MAX_FILE_SIZE_BYTES) {
        return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      }
      response.data.pipe(fs.createWriteStream(filePath));
      response.data.on('end', async () => {
        const messageBody = `✅ Downloaded Successfully`;
        api.sendMessage({ body: messageBody, attachment: fs.createReadStream(filePath) }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });
    } else {
      api.sendMessage("No video found.", event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("Sorry, an error occurred while downloading from Facebook.", event.threadID, event.messageID);
  }
};

module.exports.downloadTikTok = async function (url, api, event, filePath) {
  try {
    const res = await axios.get(`https://kaizenji-autodl-api.gleeze.com/tiktok?url=${encodeURIComponent(url)}`);
    const videoUrl = res.data.videoUrl;
    if (videoUrl) {
      const response = await axios({ method: "GET", url: videoUrl, responseType: "stream" });
      if (response.headers['content-length'] > MAX_FILE_SIZE_BYTES) {
        return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      }
      response.data.pipe(fs.createWriteStream(filePath));
      response.data.on('end', async () => {
        const messageBody = `✅ Downloaded Successfully`;
        api.sendMessage({ body: messageBody, attachment: fs.createReadStream(filePath) }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });
    } else {
      api.sendMessage("No video found.", event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("Sorry, an error occurred while downloading from TikTok.", event.threadID, event.messageID);
  }
};

module.exports.checkLink = function (url) {
  const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/[^\s/?#]+\/?/;
  const facebookRegex = /https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/[^\s/?#]+\/?/;
  const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;
  if (instagramRegex.test(url)) {
    return url;
  } else if (facebookRegex.test(url)) {
    return url;
  } else if (tiktokRegex.test(url)) {
    return url;
  }
  return null;
};