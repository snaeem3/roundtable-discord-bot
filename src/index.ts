import { Client, GatewayIntentBits, IntentsBitField } from 'discord.js';
import dotenv from 'dotenv';
import { Game } from './game/Game';

const eventHandler = require('./handlers/eventHandler');
// const {
//   Client,
//   IntentsBitField,
//   EmbedBuilder,
//   InteractionCollector,
//   ActivityType,
// } = require('discord.js');

dotenv.config(); // Load environment variables from .env file

const botData = {
  game: new Game(),
  pokeCount: 0,
};

const client = new Client({
  // intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client, botData);
client.login(process.env.DISCORD_TOKEN);
