import {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  GatewayIntentBits,
  IntentsBitField,
} from 'discord.js';
import { Player } from '../../game/Player';
import { BotData } from '../../types/types';

// const {
//   Client,
//   Interaction,
//   ApplicationCommandOptionType,
//   PermissionFlagsBits,
// } = require('discord.js');

module.exports = {
  name: 'joingame',
  description: 'Join the game',
  callback: async (client, interaction, botData: BotData) => {
    await interaction.deferReply();
    // console.log('client: ', client);
    // console.log('interaction.member.user: ', interaction.member.user);
    console.log('botData: ', botData);
    console.log('-----------------------Join Game:-----------------------');
    // const player = new Player(interaction.member)
    const [success, msg] = botData.game.joinGame(
      new Player(
        interaction.member.user.id,
        interaction.member.user.globalName,
      ),
    );
    console.log('result: ', msg);

    if (success) {
      interaction.editReply(
        `User ${interaction.member} successfully joined the game\n
        ${botData.game.livingPlayers.length} player(s) joined the game`,
      );
    } else {
      interaction.editReply(
        `User ${interaction.member} unsuccessfully joined the game: ${msg}`,
      );
    }
  },
};
