import { Player } from '../../game/Player';

const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

const defaultRoundTime = 90;

module.exports = {
  name: 'beginround',
  description: `Begins the round. Default round time: ${defaultRoundTime} seconds`,
  callback: async (client, interaction, botData) => {
    const roundSeconds =
      interaction.options.get('time')?.value || defaultRoundTime;

    await interaction.deferReply();

    if (roundSeconds < 1) {
      interaction.editReply(`${roundSeconds} seconds is invalid`);
      return;
    }
    // console.log('client: ', client);
    // console.log('interaction.member.user: ', interaction.member.user);
    console.log('botData: ', botData);
    console.log('-----------------------Begin Round:-----------------------');

    const [success, msg] = botData.game.beginDiscussionPhase(roundSeconds);

    if (success) {
      const successReply = await interaction.editReply(
        `User ${interaction.member} successfully begun the round`,
      );
      botData.game.toggleDiscussionPhaseInProgress();

      const timeRemainingReply = await interaction.followUp(
        `${roundSeconds} second round **Round ends <t:${Math.floor(
          addSecondsToDate(roundSeconds) / 1000,
        )}:R>**`,
      );

      setTimeout(async () => {
        await timeRemainingReply.delete();
        const timeUpReply = await interaction.followUp(
          `Time's up! Submit your actions`,
        );
        botData.game.toggleDiscussionPhaseInProgress();
      }, roundSeconds * 1000);
    } else {
      await interaction.editReply(
        `User ${interaction.member} unsuccessfully begun the round: ${msg}`,
      );
    }
  },
  options: [
    {
      name: 'time',
      description: 'Round time in seconds',
      type: ApplicationCommandOptionType.Integer,
    },
  ],
};

function addSecondsToDate(seconds: number) {
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + seconds * 1000); // Convert seconds to milliseconds

  return futureDate;
}
