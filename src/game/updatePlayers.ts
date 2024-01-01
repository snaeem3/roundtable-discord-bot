import { Action, Activity, ActivityChecked } from '../types/types';
import { Player } from './Player';
import moveLivingToDead from './moveLivingToDead';
import resolveBackstabPenParries from './resolveBackstabsPenParries';
import resolveDMG from './resolveDMG';
import successfulDW from './successfulDeathWish';
import successfulParry from './successfulParry';

export default function updatePlayers(
  livingPlayers: Player[],
  deadPlayers: Player[],
  activities: Activity[],
) {
  // Only go through living player activities
  const livingPlayerActivities = activities.filter(
    (activity) => !activity.player.ghost,
  );

  const checkedActivities = livingPlayerActivities.map((activity) => {
    const checkedActivity: ActivityChecked = {
      player: activity.player,
      action: activity.action,
      ally: activity.ally,
      targets: activity.targets,
      finalAction: 'none',
      successfulAlly: false,
    };
    return checkedActivity;
  });

  // Update successful Ally in checkedActivities
  checkedActivities.forEach((activity) => {
    // ally chosen by current player
    const submittedAlly = activity.ally;

    // who their potential ally actually chose
    const submittedAllySubmittedAlly = checkedActivities.find(
      (act) => act.player.id === submittedAlly?.id,
    )?.ally;

    // Check that the allies are a match
    if (
      submittedAlly &&
      submittedAllySubmittedAlly &&
      activity.player.id === submittedAllySubmittedAlly.id // Current player id vs. id of who potential ally wrote down
    ) {
      activity.successfulAlly = true;

      // update alliances in livingPlayers for the current player
      const livingPlayerIndex = livingPlayers.findIndex(
        (livingPlayer) => livingPlayer.id === activity.player.id,
      );
      livingPlayers[livingPlayerIndex].addUniqueAlly(submittedAlly);
    }
  });

  // Check for successful Throwing Knives and update Final Action
  checkedActivities.forEach((checkedActivity) => {
    if (checkedActivity.action === Action.ThrowingKnives) {
      // Get the actual data for each target
      let target0Id: string;
      if (checkedActivity.targets) target0Id = checkedActivity.targets[0].id;
      const target0Activity = checkedActivities.find(
        (act) => target0Id === act.player.id,
      );

      let target1Id: string;
      if (checkedActivity.targets && checkedActivity.targets.length === 2)
        target1Id = checkedActivity.targets[1].id;
      const target1Activity = checkedActivities.find(
        (act) => target1Id === act.player.id,
      );

      // Check that both targets successfully allied and allied each other
      if (
        target0Activity?.successfulAlly &&
        target1Activity?.successfulAlly &&
        target0Activity.ally?.id === target1Activity.player.id
      ) {
        checkedActivity.finalAction = Action.ThrowingKnives;

        // Apply 1 DMG to each Throwing Knives Target
        const livingPlayerIndex0 = livingPlayers.findIndex(
          (livingPlayer) => livingPlayer.id === target0Id,
        );
        const livingPlayerIndex1 = livingPlayers.findIndex(
          (livingPlayer) => livingPlayer.id === target1Id,
        );

        livingPlayers[livingPlayerIndex0].addRoundDMG({
          amount: 1,
          originator: checkedActivity.player,
          type: Action.ThrowingKnives,
        });

        livingPlayers[livingPlayerIndex1].addRoundDMG({
          amount: 1,
          originator: checkedActivity.player,
          type: Action.ThrowingKnives,
        });
      }
    }
  });

  const throwingKnivesUpdates = resolveDMG(
    livingPlayers,
    deadPlayers,
    checkedActivities,
  );
  livingPlayers = throwingKnivesUpdates.updatedLivingPlayers;
  deadPlayers = throwingKnivesUpdates.updatedDeadPlayers;

  // Update Slashes and Parries to Backstabs and Penultimate Parries
  checkedActivities.forEach((checkedActivity) => {
    if (checkedActivity.successfulAlly) {
      if (
        checkedActivity.action === Action.Slash &&
        checkedActivity.targets &&
        checkedActivity.ally &&
        checkedActivity.targets[0].id === checkedActivity.ally.id
      ) {
        checkedActivity.action = Action.Backstab;
      } else if (
        checkedActivity.action === Action.Parry &&
        checkedActivity.targets &&
        checkedActivity.ally &&
        checkedActivity.targets[0].id === checkedActivity.ally.id
      ) {
        checkedActivity.action = Action.PenultimateParry;
      }
    }
  });

  const backstabPenParryUpdates = resolveBackstabPenParries(
    livingPlayers,
    deadPlayers,
    checkedActivities,
  );
  livingPlayers = backstabPenParryUpdates.updatedLivingPlayers;
  deadPlayers = backstabPenParryUpdates.updatedDeadPlayers;

  // Check Deathwishes
  const diedFromSuccessfulDW: Player[] = [];
  const diedFromUnsuccessfulDW: Player[] = [];
  checkedActivities.forEach((checkedActivity) => {
    if (checkedActivity.action === Action.Deathwish) {
      const attackers = successfulDW(checkedActivity.player, checkedActivities);

      if (!attackers) diedFromUnsuccessfulDW.push(checkedActivity.player);
      else {
        diedFromSuccessfulDW.push(...attackers);
        const currentPlayerIndex = livingPlayers.findIndex(
          (livingPlayer) => livingPlayer.id === checkedActivity.player.id,
        );
        livingPlayers[currentPlayerIndex].soloKills.push(...attackers);
      }
    }
  });
  const dwUpdates = moveLivingToDead(
    livingPlayers,
    deadPlayers,
    [diedFromSuccessfulDW, diedFromUnsuccessfulDW].flat(),
  );
  livingPlayers = dwUpdates.updatedLivingPlayers;
  deadPlayers = dwUpdates.updatedDeadPlayers;

  // Apply Slash DMG to living players
  const diedFromParry: Player[] = [];
  const livingPlayerIds = livingPlayers.map((livingPlayer) => livingPlayer.id);
  checkedActivities.forEach((checkedActivity) => {
    // Check if player is still alive and slashed
    if (
      livingPlayerIds.includes(checkedActivity.player.id) &&
      checkedActivity.action === Action.Slash &&
      checkedActivity.targets !== undefined
    ) {
      const targetId = checkedActivity.targets[0].id;
      const targetIndex = livingPlayers.findIndex(
        (livingPlayer) => livingPlayer.id === targetId,
      );
      if (targetIndex !== -1) {
        // target is still alive
        // Check if target parried this slash
        const targetActivity = checkedActivities.find(
          (activity) => activity.player.id === targetId,
        );
        if (
          targetActivity?.action === Action.Parry &&
          successfulParry(
            targetActivity.player,
            checkedActivity.player,
            checkedActivities,
          )
        ) {
          diedFromParry.push(checkedActivity.player);
          livingPlayers[targetIndex].soloKills.push(checkedActivity.player);
        } else {
          // target did not parry so add a DMG
          livingPlayers[targetIndex].addRoundDMG({
            amount: checkedActivity.player.dmg,
            type: Action.Slash,
            originator: checkedActivity.player,
          });
        }
      }
    }
  });
  const parryUpdates = moveLivingToDead(
    livingPlayers,
    deadPlayers,
    diedFromParry,
  );
  livingPlayers = parryUpdates.updatedLivingPlayers;
  deadPlayers = parryUpdates.updatedDeadPlayers;

  const slashUpdates = resolveDMG(
    livingPlayers,
    deadPlayers,
    checkedActivities,
  );
  livingPlayers = slashUpdates.updatedLivingPlayers;
  deadPlayers = slashUpdates.updatedDeadPlayers;

  // Update dmg bonus for every living player
  livingPlayers.forEach((livingPlayer) => {
    livingPlayer.updateDMG();
  });
  // Set every dead player to ghost
  deadPlayers.forEach((deadPlayer) => (deadPlayer.ghost = true));

  return {
    updatedLivingPlayers: livingPlayers,
    updatedDeadPlayers: deadPlayers,
    checkedActivities,
  };
}
