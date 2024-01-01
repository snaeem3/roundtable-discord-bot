import { Action, ActivityChecked } from '../types/types';
import { Player } from './Player';
import moveLivingToDead from './moveLivingToDead';

export default function resolveBackstabPenParries(
  livingPlayers: Player[],
  deadPlayers: Player[],
  checkedActivities: ActivityChecked[],
) {
  // Only check living player activities
  const livingPlayerIds = livingPlayers.map((livingPlayer) => livingPlayer.id);
  const filteredCheckedActivities = checkedActivities.filter(
    (checkedActivity) => livingPlayerIds.includes(checkedActivity.player.id),
  );

  // Check Backstabs and succesful Penultimate parries
  const deadFromPenParry: Player[] = [];
  const deadFromBackstab: Player[] = [];
  filteredCheckedActivities.forEach((checkedActivity) => {
    const currentPlayerIndex = livingPlayers.findIndex(
      (livingPlayer) => livingPlayer.id === checkedActivity.player.id,
    );
    if (
      checkedActivity.action === Action.Backstab &&
      checkedActivity.targets !== undefined
    ) {
      const targetId = checkedActivity.targets[0].id;
      const allyActivity = checkedActivities.find(
        (act) => act.player.id === targetId,
      );
      if (allyActivity?.action === Action.PenultimateParry) {
        // backstabber dies, penultimate parrier gets a solo kill
        deadFromPenParry.push(checkedActivity.player);
        const successfulParrierIndex = livingPlayers.findIndex(
          (livingPlayer) => livingPlayer.id === allyActivity.player.id,
        );
        livingPlayers[successfulParrierIndex].soloKills.push(
          checkedActivity.player,
        );
      } else {
        // target player dies, backstabber gets a solo kill
        deadFromBackstab.push(checkedActivity.targets[0]);
        livingPlayers[currentPlayerIndex].soloKills.push(
          checkedActivity.targets[0],
        );
      }
    }
  });

  // Check unsuccessful Penultimate parries
  const deadFromUnsuccessfulPenParry: Player[] = [];
  filteredCheckedActivities.forEach((checkedActivity) => {
    if (
      checkedActivity.action === Action.PenultimateParry &&
      checkedActivity.targets !== undefined
    ) {
      const targetId = checkedActivity.targets[0].id;
      const allyActivity = checkedActivities.find(
        (act) => act.player.id === targetId,
      );
      if (allyActivity?.action !== Action.Backstab)
        deadFromUnsuccessfulPenParry.push(checkedActivity.player);
    }
  });

  const updates = moveLivingToDead(
    livingPlayers,
    deadPlayers,
    [deadFromBackstab, deadFromPenParry, deadFromUnsuccessfulPenParry].flat(),
  );

  return {
    updatedLivingPlayers: updates.updatedLivingPlayers,
    updatedDeadPlayers: updates.updatedDeadPlayers,
  };
}
