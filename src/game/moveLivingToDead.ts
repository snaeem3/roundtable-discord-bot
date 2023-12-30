import { Player } from './Player';

export default function moveLivingToDead(
  livingPlayers: Player[],
  deadPlayers: Player[],
  playersToMove: Player[],
) {
  let updatedLivingPlayers = livingPlayers;
  playersToMove.forEach((playerToMove) => {
    updatedLivingPlayers = updatedLivingPlayers.filter((livingPlayer) => {
      if (livingPlayer.id === playerToMove.id) {
        deadPlayers.push(livingPlayer);
        return false; // don't include in new updatedLivingPlayers[]
      }
      return true;
    });
  });

  return { updatedLivingPlayers, updatedDeadPlayers: deadPlayers };
}
