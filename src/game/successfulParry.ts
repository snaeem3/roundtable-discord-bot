import { Action, Activity } from '../types/types';
import { Player } from './Player';

export default function successfulParry(
  player: Player,
  parryTarget: Player,
  activities: Activity[],
) {
  // Remove the given player's activity from the array
  const filteredActivities = activities.filter((activity) => {
    if (activity.player.id === player.id) {
      // If the parrying player didn't actually submit death wish, then we have an error
      if (activity.action !== Action.Parry) {
        console.warn(`${player.name} did not parry`);
        throw new Error(`${player.name} did not parry`);
      }
      return false;
    }
    return true;
  });

  const targetActivity = filteredActivities.find(
    (activity) => activity.player.id === parryTarget.id,
  );

  if (
    targetActivity &&
    targetActivity.action === Action.Slash &&
    targetActivity.targets &&
    targetActivity.targets[0].id === player.id
  )
    return true;

  return false;
}
