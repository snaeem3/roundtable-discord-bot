const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'initializegame',
  description: 'Initializes game and enables joingame',
  callback: async (client, interaction, botData) => {
    await interaction.deferReply();
    // console.log('client: ', client);
    // console.log('interaction: ', interaction);
    console.log('botData: ', botData);
    console.log(
      '-----------------------Initialize Game:-----------------------',
    );
    const [success, msg] = botData.game.initiateGame();
    console.log('result: ', msg);

    if (success) {
      interaction.editReply(
        `User ${interaction.member} successfully initialized a game`,
      );
    } else {
      interaction.editReply(
        `User ${interaction.member} unsuccessfully initialized a game: ${msg}`,
      );
    }
  },
};
