import {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from 'discord.js';
import { Player } from '../../game/Player';
import { Game } from '../../game/Game';
import { Action, BotData, GamePhase } from '../../types/types';

// const {
//   Client,
//   Interaction,
//   ApplicationCommandOptionType,
//   PermissionFlagsBits,
// } = require('discord.js');

module.exports = {
  name: 'submitactivity',
  description: `Submit your action and ally (if applicable)`,
  callback: async (client: Client, interaction, botData: BotData) => {
    const action = interaction.options.get('action');
    const ally = interaction.options.get('ally');
    const target1 = interaction.options.get('target');
    const target2 = interaction.options.get('targetsecondary');
    await interaction.deferReply({ ephemeral: true });
    console.log('botData: ', botData);
    console.log('----------------------Activity Submit:----------------------');

    let currentPlayer: Player;
    try {
      currentPlayer = botData.game.getPlayerInfo(interaction.member.user.id);
    } catch (error) {
      await interaction.editReply(
        `You (${interaction.member}) are not a valid living player`,
      );
      return;
    }
    let allyPlayer: Player | undefined;
    if (ally)
      try {
        allyPlayer = botData.game.getPlayerInfo(ally.user.id);
      } catch (error) {
        await interaction.editReply(
          `${ally.member} is not a valid living player`,
        );
        return;
      }
    let targetPlayer1: Player;
    if (target1)
      try {
        targetPlayer1 = botData.game.getPlayerInfo(target1.user.id);
      } catch (error) {
        await interaction.editReply(
          `${target1.member} is not a valid living player`,
        );
        return;
      }
    let targetPlayer2: Player;
    if (target2)
      try {
        targetPlayer2 = botData.game.getPlayerInfo(target2.user.id);
      } catch (error) {
        await interaction.editReply(
          `${target2.member} is not a valid living player`,
        );
        return;
      }
    console.log(currentPlayer);
    console.log(action.value);
    console.log(allyPlayer);
    console.log(targetPlayer1);
    console.log(targetPlayer2);
    let targets: [Player] | [Player, Player] | undefined;
    if (targetPlayer1) targets = [targetPlayer1];
    if (targetPlayer1 && targetPlayer2)
      targets = [targetPlayer1, targetPlayer2];
    if (targetPlayer1 === undefined) targets = undefined;
    const [success, msg] = botData.game.submitActivity(
      currentPlayer,
      action.value,
      allyPlayer,
      targets,
    );

    if (success) {
      const successReply = await interaction.editReply(
        `Activity successfully submitted`,
      );

      const channelReply = await interaction.followUp(
        `User ${interaction.member} successfully submitted their Action/Ally\n
        ${msg}`,
      );

      if (botData.game.gameComplete) {
        const gameOverReply = await interaction.followUp(
          botData.game.gameResults,
        );
      }

      if (botData.game.currentPhase === GamePhase.ActionResolve) {
        const roundResultReply = await interaction.followUp(
          botData.game.recentRoundResult,
        );
      }
    } else {
      await interaction.editReply(
        `User ${interaction.member} unsuccessfully submitted Action/Ally:\n
        ${msg}`,
      );
    }
  },
  options: [
    {
      name: 'action',
      description: 'Action selection',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Slash', value: Action.Slash },
        { name: 'Parry', value: Action.Parry },
        { name: 'Deathwish', value: Action.Deathwish },
        { name: 'Throwing Knives', value: Action.ThrowingKnives },
        { name: 'Truce', value: Action.Truce },
        { name: 'Renounce', value: Action.Renounce },
      ],
      required: true,
    },
    {
      name: 'ally',
      description: 'Ally selection',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'target',
      description: 'Target selection',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'targetsecondary',
      description: 'Secondary Target (for Throwing Knives)',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
};
