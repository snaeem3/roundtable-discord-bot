import { Player } from '../../game/Player';

const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'joingame',
  description: 'Join the game',
  callback: async (client, interaction, botData) => {
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
        `User ${interaction.member} successfully joined the game`,
      );
    } else {
      interaction.editReply(
        `User ${interaction.member} unsuccessfully joined the game: ${msg}`,
      );
    }
  },
};
