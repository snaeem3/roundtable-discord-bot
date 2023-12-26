import { Game } from './game/Game';

const eventHandler = require('./handlers/eventHandler');

require('dotenv/config');
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  InteractionCollector,
  ActivityType,
} = require('discord.js');

const client = new Client({
  // intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const botData = {
  game: new Game(),
  pokeCount: 0,
};
eventHandler(client, botData);

client.login(process.env.DISCORD_TOKEN);
