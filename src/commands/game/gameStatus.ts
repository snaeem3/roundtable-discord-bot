const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  codeBlock,
} = require('discord.js');

module.exports = {
  name: 'gamestatus',
  description: 'Returns the current game status',
  callback: async (client, interaction, botData) => {
    await interaction.deferReply();
    // console.log('client: ', client);
    // console.log('interaction: ', interaction);
    console.log('botData: ', botData);
    console.log('-----------------------Game Status:-----------------------');
    const { gameStatus } = botData.game;
    console.table(gameStatus);
    const gameStatusString = JSON.stringify(gameStatus);
    console.log(gameStatusString);
    try {
      await interaction.editReply(codeBlock(gameStatusString));
    } catch (error) {
      console.error('Error retrieving Game Status: ', error);
    }
  },
};
