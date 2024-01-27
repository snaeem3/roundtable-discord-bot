import {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Attachment,
  AttachmentBuilder,
  EmbedBuilder,
} from 'discord.js';
import {
  UltimateTextToImage,
  HorizontalImage,
  VerticalImage,
} from 'ultimate-text-to-image';
import path from 'path'; // Using fs.promises for asynchronous file operations
import { Player } from '../../game/Player';
import { Game } from '../../game/Game';
import { Action, BotData, GamePhase } from '../../types/types';
import activitiesToTable from '../../game/activitiesToTable';

const fs = require('fs').promises;

// const {
//   Client,
//   Interaction,
//   ApplicationCommandOptionType,
//   PermissionFlagsBits,
// } = require('discord.js');

function findLongestStringLength(matrix: string[][]) {
  let maxLength = 0;

  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix[i].length; j += 1) {
      const currentLength = matrix[i][j].length;
      if (currentLength > maxLength) {
        maxLength = currentLength;
      }
    }
  }

  return maxLength;
}
function appendUnderscoresToLength(str: string, X: number) {
  if (str.length < X) {
    const underscoresToAdd = X - str.length;
    const underscores = '_'.repeat(underscoresToAdd);
    return str + underscores;
  }
  return str; // No need to append underscores if the string is already longer than or equal to X
}

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
    console.log('current player: ', currentPlayer);
    console.log(action.value);
    console.log('ally: ', allyPlayer);
    console.log('target1: ', targetPlayer1);
    console.log('target2: ', targetPlayer2);
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

      console.log('current round activity:');
      console.log(botData.game.currentRoundActivity);

      if (botData.game.currentPhase === GamePhase.ActionResolve) {
        const deathsArray = botData.game.recentRoundResult;
        console.log(deathsArray);
        // let output = '---------------Actions---------------\n';
        const { actionMatrix, allyMatrix } = activitiesToTable(
          botData.game.currentRoundActivity,
        );
        console.table(actionMatrix);

        const longestString = findLongestStringLength(actionMatrix);

        const actionImgMatrix = [];
        const allyImgMatrix = [];
        const backgroundColor = '#000000';
        for (let row = 0; row < actionMatrix.length; row += 1) {
          const actionRowArray = [];
          const allyRowArray = [];
          for (let col = 0; col < actionMatrix[row].length; col += 1) {
            // Make every text the same length
            const actionText = appendUnderscoresToLength(
              actionMatrix[row][col],
              longestString,
            );
            let fontColor = '#00FF00';
            if (row === 0 || col === 0) fontColor = '#ff00ff';
            if (actionText.split('').every((char) => char === '_'))
              fontColor = backgroundColor; // Camoflauge underscores
            const actionTextToImage = new UltimateTextToImage(actionText, {
              // backgroundColor,
              fontSize: 60,
              fontColor,
              fontFamily: 'Consolas',
              margin: 20,
            });
            actionRowArray.push(actionTextToImage);

            // Make every text the same length
            const allyText = appendUnderscoresToLength(
              allyMatrix[row][col].toString(),
              longestString,
            );
            fontColor = '#00FF00';
            if (row === 0 || col === 0) fontColor = '#ff00ff';
            if (row === col) fontColor = backgroundColor; // Can't ally with self, so hide diagonal
            if (allyText.split('').every((char) => char === '_'))
              fontColor = backgroundColor; // Camoflauge underscores
            const allyTextToImage = new UltimateTextToImage(allyText, {
              // backgroundColor,
              fontSize: 60,
              fontColor,
              fontFamily: 'Consolas',
              margin: 20,
            });
            allyRowArray.push(allyTextToImage);
          }

          const actionRowImg = new HorizontalImage(actionRowArray, {
            backgroundColor,
          });
          actionImgMatrix.push(actionRowImg);
          const allyRowImg = new HorizontalImage(allyRowArray, {
            backgroundColor,
          });
          allyImgMatrix.push(allyRowImg);
        }
        const finalActionImg = new VerticalImage(actionImgMatrix);
        finalActionImg.render().toFile(path.join(__dirname, 'actionsImg.png'));
        const actionImagePath = path.join(__dirname, 'actionsImg.png');
        // console.log('actionImagePath: ', actionImagePath);

        const finalAllyImg = new VerticalImage(allyImgMatrix);
        finalAllyImg.render().toFile(path.join(__dirname, 'allyImg.png'));
        const allyImagePath = path.join(__dirname, 'allyImg.png');

        const actionFile = new AttachmentBuilder(actionImagePath);
        const allyFile = new AttachmentBuilder(allyImagePath);
        const actionsEmbed = new EmbedBuilder()
          .setTitle(`Round ${botData.game.currentRoundNum} Actions`)
          .setImage('attachment://actionsImg.png');

        const allyEmbed = new EmbedBuilder()
          .setTitle(`Round ${botData.game.currentRoundNum} Allies`)
          .setImage('attachment://allyImg.png');

        try {
          await interaction.followUp({
            embeds: [actionsEmbed, allyEmbed],
            files: [actionFile, allyFile],
          });
          console.log('Image sent successfully!');

          // Delete the image file after sending
          await fs.unlink(actionImagePath);
          await fs.unlink(allyImagePath);
          console.log('Image file deleted.');
        } catch (error) {
          console.error('Error:', error);
        }

        let output = '---------------Round Deaths---------------\n';
        deathsArray.forEach((deathsObj) => {
          console.log(deathsObj);
          for (const [deathType, deadPlayers] of Object.entries(deathsObj)) {
            const playerNames = deadPlayers.map(
              (deadPlayer) => ` ${deadPlayer.name} `,
            );
            const formattedValue = playerNames.toString();
            output += `${deathType} deaths: ${formattedValue}\n`;
          }
        });

        output += '---------------Living Player Rankings---------------\n';
        output += 'Player Name | Tiebreaker Score\n';

        const rankedLivingPlayers = botData.game.livingPlayers.sort(
          (a, b) => b.tieBreakerScore - a.tieBreakerScore,
        );

        rankedLivingPlayers.forEach((livingPlayer, i) => {
          output += `${livingPlayer.name} | ${livingPlayer.tieBreakerScore}\n`;
        });

        output += '----------------------------------------------------\n';
        const roundResultReply = await interaction.followUp(output);
      }

      if (botData.game.gameComplete) {
        const gameOverReply = await interaction.followUp(
          botData.game.gameResults,
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
