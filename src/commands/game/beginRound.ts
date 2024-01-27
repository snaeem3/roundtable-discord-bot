import {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  GatewayIntentBits,
  IntentsBitField,
} from 'discord.js';
import { Player } from '../../game/Player';
import { BotData, GamePhase } from '../../types/types';

// const {
//   Client,
//   Interaction,
//   ApplicationCommandOptionType,
//   PermissionFlagsBits,
// } = require('discord.js');

const defaultRoundTime = 90;

module.exports = {
  name: 'beginround',
  description: `Begins the round. Default round time: ${defaultRoundTime} seconds`,
  callback: async (client, interaction, botData: BotData) => {
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
        `User ${interaction.member} successfully began the round`,
      );

      const endTime = addSecondsToDate(roundSeconds);
      console.log('endTime: ', endTime);
      const timeRemainingReply = await interaction.followUp(
        `${roundSeconds} second round **Round ends <t:${endTime}:R>**`,
      );

      setTimeout(async () => {
        await timeRemainingReply.delete();
        const sortedLivingPlayers = botData.game.livingPlayers.sort(
          (a, b) => b.tieBreakerScore - a.tieBreakerScore,
        );
        const livingPlayerNames = sortedLivingPlayers
          .map(
            (livingPlayer) =>
              `${livingPlayer.name} (${livingPlayer.tieBreakerScore})`,
          )
          .join('\n');
        const timeUpReply = await interaction.followUp(
          `Time's up! Submit your actions\n\nCurrent Living Players:\n${livingPlayerNames}`,
        );
        botData.game.currentPhase = GamePhase.ActionSubmit;
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
  const OFFSET = 0; // Time sometimes seems to be off by a number
  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getTime() + (seconds - OFFSET) * 1000,
  ); // Convert seconds to milliseconds
  return Math.round(futureDate.getTime() / 1000);
}
