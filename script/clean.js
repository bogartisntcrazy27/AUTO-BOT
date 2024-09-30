const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "clean",
  aliases: ["cl"],
  credits: "Cliff",
  version: "2.0",
  cooldowns: 5,
  role: 0,
  hasPermission: 0,
  hasPrefix: false,
  description:"Help to clean cache and event/cache folder",
  commandCategory: "system",
  usages: "{p}{n}",
};

module.exports.run = async function ({ api, event }) {
  const cacheFolderPath = path.join(__dirname, 'cache');
  const tmpFolderPath = path.join(__dirname, 'event/cache');

  api.sendMessage({ body: 'Cleaning cache on script folders...', attachment: null }, event.threadID, () => {
    const cleanFolder = (folderPath) => {
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        if (files.length > 0) {
          files.forEach(file => {
            const filePath = path.join(folderPath, file);
            fs.unlinkSync(filePath);
            console.log(`File ${file} deleted successfully from ${folderPath}!`);
          });
          console.log(`All files in the ${folderPath} folder deleted successfully!`);
        } else {
          console.log(`${folderPath} folder is empty.`);
        }
      } else {
        console.log(`${folderPath} folder not found.`);
      }
    };

    cleanFolder(cacheFolderPath);
    cleanFolder(tmpFolderPath);

    api.sendMessage({ body: 'cache and event/cache folders cleaned successfully!' }, event.threadID);
  });
};