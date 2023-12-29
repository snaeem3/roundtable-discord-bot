import { Action, Activity } from '../types/types';
import { Player } from './Player';

export default function successfulDW(
  deathWisher: Player,
  activities: Activity[],
) {
  // Remove the given player's activity from the array
  const filteredActivities = activities.filter((activity) => {
    if (activity.player.id === deathWisher.id) {
      // If the death wisher didn't actually submit death wish, then we have an error
      if (activity.action !== Action.Deathwish) {
        console.warn(`${deathWisher.name} did not Deathwish`);
        throw new Error(`${deathWisher.name} did not Deathwish`);
      }
      return false;
    }
    return true;
  });

  // Count how many actions were slashing the death wisher
  let count = 0;
  filteredActivities.forEach((filteredActivity) => {
    if (
      filteredActivity.action === Action.Slash &&
      filteredActivity.targets &&
      filteredActivity.targets[0].id === deathWisher.id
    ) {
      count += 1;
    }
  });

  if (count < 2) return false;

  // Mexican Standoff Deathwish
  if (count === 2 && filteredActivities.length === 2) return true;

  if (count < 3) return false;

  // Otherwise count is >= 3 and is successful
  return true;
}
