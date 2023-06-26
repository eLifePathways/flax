const fs = require("fs");

const syncAllData = async () => {
    const jsFiles = [];
    const promises = [];
    const dirPath = './ExternalData';
    fs.readdirSync(dirPath).forEach((file) => {
        if (file.endsWith('.js')) {
            jsFiles.push(file);
        }
    });
    for (let i = 0; i < jsFiles.length; i++) {
        const filePath = `${dirPath}/${jsFiles[i]}`;
        try {
            const scriptModule = require(filePath);
            if (typeof scriptModule.syncData === 'function') {
                promises.push(scriptModule.syncData())
            }
        } catch (error) {
            console.error(`Error loading or executing ${filePath}:`, error);
        }
    }

    await Promise.all(promises);
    return true
}

module.exports = syncAllData
