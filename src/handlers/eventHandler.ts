import { BotData } from '../types/types';

const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client, botData: BotData) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a.localeCompare(b));

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop(); // replace backslashes with forward slashes
    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);
        await eventFunction(client, arg, botData);
      }
    });
  }
};
