import { Action, Activity } from '../types/types';

export default function activitiesToTable(activities: Activity[]) {
  const actionMatrix = createEmptyArray(activities.length);
  let allyMatrix: (string | boolean)[][];
  allyMatrix = createArrayWithDiagonal(activities.length);

  // In each row extract the targets from activities
  for (let i = 0; i < activities.length; i += 1) {
    const { player, action, ally, targets } = activities[i];

    // get the indexes
    const allyIndex = activities.findIndex(
      (activity) => activity.player.id === ally?.id,
    );

    // True if successful ally, false if unsuccessful
    if (allyIndex !== -1) {
      if (activities[allyIndex].ally?.id === player.id) {
        allyMatrix[i][allyIndex] = true;
      } else {
        allyMatrix[i][allyIndex] = false;
      }
    }

    let target0Index: number;
    if (action === Action.Deathwish) {
      actionMatrix[i][i] = Action.Deathwish;
    } else if (action === Action.ThrowingKnives) {
      if (targets !== undefined) {
        target0Index = activities.findIndex(
          (activity) => activity.player.id === targets[0].id,
        );
        const target1Index = activities.findIndex(
          (activity) => activity.player.id === targets[1]?.id,
        );
        actionMatrix[i][target0Index] = Action.ThrowingKnives;
        actionMatrix[i][target1Index] = Action.ThrowingKnives;
      }
    } else if (targets !== undefined) {
      target0Index = activities.findIndex(
        (activity) => activity.player.id === targets[0].id,
      );

      actionMatrix[i][target0Index] = action;

      // Add Total DMG if player slashed
      const dmg = activities.length === 3 ? 2 : player.dmg; // 2 DMG in Mexican standoff round
      if (action === Action.Slash)
        actionMatrix[i][target0Index] =
          `${actionMatrix[i][target0Index]} (${dmg})`;
    }
  }

  // Append and fill in the names of each player in the first row and first column
  const names = activities.map((activity) => activity.player.name);

  // First row names
  actionMatrix.unshift([]); // Add Row
  actionMatrix[0] = [...names]; // Clone otherwise it uses the reference to names
  actionMatrix[0].unshift(''); // Keep (0,0) blank
  allyMatrix.unshift([]); // Add Row
  allyMatrix[0] = [...names]; // Clone otherwise it uses the reference to names
  allyMatrix[0].unshift(''); // Keep (0,0) blank

  //   First column names
  for (let i = 1; i < activities.length + 1; i += 1) {
    actionMatrix[i] = [activities[i - 1].player.name, actionMatrix[i]].flat();
    allyMatrix[i] = [activities[i - 1].player.name, allyMatrix[i]].flat();
  }

  return { actionMatrix, allyMatrix };
}

function createEmptyArray(n: number) {
  const resultArray = [];

  for (let i = 0; i < n; i += 1) {
    const row = [];
    for (let j = 0; j < n; j += 1) {
      row.push('');
    }
    resultArray.push(row);
  }

  return resultArray;
}

function createArrayWithDiagonal(n: number) {
  const resultArray = [];

  for (let i = 0; i < n; i += 1) {
    const row = [];
    for (let j = 0; j < n; j += 1) {
      row.push(i === j ? '-' : '');
    }
    resultArray.push(row);
  }

  return resultArray;
}
