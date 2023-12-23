const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client) => {
  const eventFolders: string[] = getAllFiles(
    path.join(__dirname, '..', 'events'),
    true,
  );

  for (const eventFolder of eventFolders) {
    const eventFiles: string[] = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a.localeCompare(b));

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop(); // replace backslashes with forward slashes
    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);
        console.log(eventFile);
        await eventFunction(client, arg);
      }
    });
  }
};
