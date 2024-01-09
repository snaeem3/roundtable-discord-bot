import type { Client } from 'discord.js';

module.exports = (client: Client<true>) => {
  console.log(`${client.user.tag} is online.`);
};
