const fs = require("fs");
const path = require('path');

const getFilesFromDirectory = (dirPath)  =>{
    const files = [];
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        const nestedFiles = getFilesFromDirectory(filePath);
        files.push(...nestedFiles);
      } else if (file.endsWith('.js')) {
        files.push(filePath);
      }
    });
  
    return files;
  }

const syncAllData = async () => {
    const promises = [];
    const dirPath = './ExternalData';
    const jsFiles = getFilesFromDirectory(dirPath)

    for(let i in jsFiles) {
        const filePath = `./${jsFiles[i]}`;
        const scriptModule = require(filePath);
        promises.push(scriptModule.syncData())
    }
    await Promise.all(promises);
    return true
}

syncAllData()

module.exports = syncAllData
