import { ActivityChecked } from '../types/types';
import { Player } from './Player';
import moveLivingToDead from './moveLivingToDead';

export default function resolveDMG(
  livingPlayers: Player[],
  deadPlayers: Player[],
  checkedActivities: ActivityChecked[],
) {
  // Extract each living player that has taken DMG
  const damagedPlayers = livingPlayers.filter(
    (livingPlayer) => livingPlayer.roundDmgReceived.length > 0,
  );

  const stagedForDeath: Player[] = [];

  damagedPlayers.forEach((damagedPlayer) => {
    let allyAvailableDEF = 0;
    const damagedPlayerActivity = checkedActivities.find(
      (act) => act.player.id === damagedPlayer.id,
    );
    if (damagedPlayerActivity?.successfulAlly && damagedPlayerActivity.ally) {
      // Find out how much DMG the ally received
      const allyId = damagedPlayerActivity.ally.id;
      if (allyId) {
        // Check living players, not allied players in case ally received no DMG
        const allyDmgReceived = livingPlayers.find(
          (livingPlayer) => livingPlayer.id === allyId,
        )?.totalRoundDmgReceived;

        const allyDEF = livingPlayers.find(
          (livingPlayer) => livingPlayer.id === allyId,
        )?.def;

        // If player has a successful ally, check if DMG received >= DEF + MAX(0,(Ally's DEF - Ally's DMG taken))
        if (allyDEF !== undefined && allyDmgReceived !== undefined)
          allyAvailableDEF = Math.max(0, allyDEF - allyDmgReceived);
      }
    }
    const totalDef = damagedPlayer.def + allyAvailableDEF;

    // Check if player has taken enough DMG to die
    if (damagedPlayer.totalRoundDmgReceived >= totalDef) {
      // If player received all DMG from 1 player, award that player a solo kill
      if (damagedPlayer.roundDmgReceived.length === 1) {
        const soloKillerIndex = livingPlayers.findIndex(
          (livingPlayer) =>
            livingPlayer.id === damagedPlayer.roundDmgReceived[0].originator.id,
        );
        livingPlayers[soloKillerIndex].soloKills.push(damagedPlayer);
      } else {
        // Otherwise award every participant an assisted kill
        damagedPlayer.roundDmgReceived.forEach((dmg) => {
          const assistKillerIndex = livingPlayers.findIndex(
            (livingPlayer) => livingPlayer.id === dmg.originator.id,
          );
          livingPlayers[assistKillerIndex].assistedKills.push(damagedPlayer);
        });
      }
      // move this player to the staged for death array
      stagedForDeath.push(damagedPlayer);
    }
  });

  // Move all marked for death players from living to dead
  const updates = moveLivingToDead(livingPlayers, deadPlayers, stagedForDeath);

  return {
    updatedLivingPlayers: updates.updatedLivingPlayers,
    updatedDeadPlayers: updates.updatedDeadPlayers,
  };
}

// A and B ally
// A gets parried by C
// D slashes B
// How much DMG does D need to deal to B? 2 or 4?
// 4
