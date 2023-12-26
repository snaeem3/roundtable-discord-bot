const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'resetgame',
  description: 'Resets all game variables',
  callback: async (client, interaction, botData) => {
    await interaction.deferReply();
    // console.log('client: ', client);
    // console.log('interaction: ', interaction);
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
