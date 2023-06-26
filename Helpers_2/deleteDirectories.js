const fs = require('fs');
const rimraf = require("rimraf");

module.exports = (parentDirectory, keepDirectory) => {
    fs.readdir(parentDirectory, (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
      
        // Filter out the directory to keep
        const directoriesToDelete = files.filter(file => { 
            console.log({currentFile: file, keepFile: keepDirectory})
            return file !== keepDirectory
        });

        // Delete each directory
        directoriesToDelete.forEach(directory => {
          const directoryPath = `${parentDirectory}/${directory}`;
          rimraf.sync(directoryPath);
        });
      });
}
