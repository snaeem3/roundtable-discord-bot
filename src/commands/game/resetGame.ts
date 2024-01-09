import { BotData } from '../../types/types';

const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'resetgame',
  description: 'Resets all game variables',
  devOnly: true,
  callback: async (client, interaction, botData: BotData) => {
    await interaction.deferReply();
    console.log('botData: ', botData);
    console.log('-----------------------Reset Game:-----------------------');
    const [success, msg] = botData.game.resetGame();
    console.log('result: ', msg);

    if (success) {
      interaction.editReply(
        `User ${interaction.member} successfully reset the game`,
      );
    } else {
      interaction.editReply(
        `User ${interaction.member} unsuccessfully reset the game: ${msg}`,
      );
    }
  },
};
