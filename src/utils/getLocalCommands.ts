import { Command } from '../types/types';

const path = require('path');
const getAllFiles = require('./getAllFiles');

module.exports = (exceptions = []) => {
  const localCommands: Command[] = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, '..', 'commands'),
    true,
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject = require(commandFile);

      if (exceptions.includes(commandObject.name)) {
        continue;
      }
      console.log('commandObject: ', commandObject);
      localCommands.push(commandObject);
    }
  }

  console.log(commandCategories);
  return localCommands;
};
