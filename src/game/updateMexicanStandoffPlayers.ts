import { Action, Activity, ActivityChecked } from '../types/types';
import { Player } from './Player';
import moveLivingToDead from './moveLivingToDead';
import resolveDMG from './resolveDMG';
import successfulDW from './successfulDeathWish';

export default function updateMexicanStandoffPlayers(
  livingPlayers: [Player, Player, Player],
  deadPlayers: Player[],
  activities: [Activity, Activity, Activity],
) {
  let updatedLivingPlayers: Player[];
  updatedLivingPlayers = livingPlayers;
  let updatedDeadPlayers = deadPlayers;
  let successful = false;
  activities.forEach((activity, i) => {
    const playerIndex = livingPlayers.findIndex(
      (livingPlayer) => livingPlayer.id === activity.player.id,
    );

    if (activity.action === Action.Deathwish) {
      const attackers = successfulDW(activity.player, activities);
      if (attackers) {
        livingPlayers[playerIndex].victoryPoints += 5;
        livingPlayers[playerIndex].soloKills.push({
          player: attackers[0],
          method: Action.Deathwish,
        });
        livingPlayers[playerIndex].soloKills.push({
          player: attackers[1],
          method: Action.Deathwish,
        });
        const updates = moveLivingToDead(livingPlayers, deadPlayers, attackers);
        updatedLivingPlayers = updates.updatedLivingPlayers;
        updatedDeadPlayers = updates.updatedDeadPlayers;
        successful = true;
        return;
      }
      // this player becomes a dead player
      const updates = moveLivingToDead(livingPlayers, deadPlayers, [
        activity.player,
      ]);
      updatedLivingPlayers = updates.updatedLivingPlayers;
      updatedDeadPlayers = updates.updatedDeadPlayers;
    }
  });
  if (successful) return { updatedLivingPlayers, updatedDeadPlayers };

  activities.forEach((activity, i) => {
    const playerIndex = updatedLivingPlayers.findIndex(
      (livingPlayer) => livingPlayer.id === activity.player.id,
    );
    // if (activity.action === Action.Parry) {
    //   if (
    //     activity.targets &&
    //     successfulParry(activity.player, activity.targets[0], activities)
    //   ) {
    //     // Award a solo kill on a successful parry
    //     updatedLivingPlayers[playerIndex].soloKills.push(activity.targets[0]);

    //     // Get new living and dead players
    //     const updates = moveLivingToDead(
    //       updatedLivingPlayers,
    //       updatedDeadPlayers,
    //       [activity.targets[0]],
    //     );
    //     updatedLivingPlayers = updates.updatedLivingPlayers;
    //     updatedDeadPlayers = updates.updatedDeadPlayers;
    //   }
    // }

    if (activity.action === Action.Slash && activity.targets) {
      const slashTargetId = activity.targets[0].id;
      const slashTargetActivity = activities.find(
        (act) => act.player.id === slashTargetId,
      );
      // Check if slash was parried
      if (
        slashTargetActivity?.action === Action.Parry &&
        slashTargetActivity.targets &&
        slashTargetActivity.targets[0].id === activity.player.id
      ) {
        const parrierIndex = updatedLivingPlayers.findIndex(
          (livingPlayer) => livingPlayer.id === slashTargetId,
        );
        // Award the parrying player a solo kill
        updatedLivingPlayers[parrierIndex].soloKills.push({
          player: activity.player,
          method: Action.Parry,
        });
        // Move the current player to dead
        const updates = moveLivingToDead(
          updatedLivingPlayers,
          updatedDeadPlayers,
          [activity.player],
        );
        updatedLivingPlayers = updates.updatedLivingPlayers;
        updatedDeadPlayers = updates.updatedDeadPlayers;
      } else {
        // Otherwise add a DMG to the target
        const slashTargetIndex = updatedLivingPlayers.findIndex(
          (livingPlayer) => livingPlayer.id === slashTargetId,
        );

        if (slashTargetIndex !== -1) {
          updatedLivingPlayers[slashTargetIndex].addRoundDMG({
            amount: 2,
            type: Action.Slash,
            originator: activity.player,
          });
        }
      }
    }
  });

  const activitiesChecked: ActivityChecked[] = [];
  activities.forEach((activity) => {
    activitiesChecked.push({
      player: activity.player,
      action: activity.action,
      targets: activity.targets,
      finalAction: activity.action,
    });
  });

  // Resolve all Slash DMG and award assisted/solo kills
  const updates = resolveDMG(
    updatedLivingPlayers,
    updatedDeadPlayers,
    activitiesChecked,
  );

  updatedLivingPlayers = updates.updatedLivingPlayers;
  updatedDeadPlayers = updates.updatedDeadPlayers;

  // Not really necessary, but update dmg bonus for every living player
  updatedLivingPlayers.forEach((livingPlayer) => {
    livingPlayer.updateDMG();
  });

  // Give the last living player 5 victory points
  if (updatedLivingPlayers.length === 1)
    updatedLivingPlayers[0].victoryPoints += 5;

  // Set every dead player to ghost
  updatedDeadPlayers.forEach((deadPlayer) => (deadPlayer.ghost = true));

  return { updatedLivingPlayers, updatedDeadPlayers };
}
