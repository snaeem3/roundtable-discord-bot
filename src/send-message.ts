import 'dotenv/config';
import {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

const client = new Client({
  // intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const roles = [
  {
    id: '1187876219514015845',
    label: 'Red',
  },
  {
    id: '1187876439912099890',
    label: 'Blue',
  },
];

client.on('ready', async (c) => {
  console.log(`${c.user.tag} is online.`);

  try {
    const channel = await client.channels.cache.get('1187124390966612031');
    if (!channel) return;

    const row = new ActionRowBuilder();
    roles.forEach((role) => {
      row.components.push(
        new ButtonBuilder()
          .setCustomId(role.id)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Primary),
      );
    });

    await channel.send({
      content: 'Claim or remove role',
      components: [row],
    });
    process.exit();
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.DISCORD_TOKEN);
