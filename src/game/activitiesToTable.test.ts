import { Activity, Action } from '../types/types';
import { Player } from './Player';
import activitiesToTable from './activitiesToTable';

let player1: Player;
let player2: Player;
let player3: Player;
let player4: Player;

let activity1: Activity;
let activity2: Activity;
let activity3: Activity;
let activity4: Activity;

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
  player4 = new Player('02468', 'Ryan');
});

test('Every player deathwish creates a diagonal matrix', () => {
  activity1 = {
    player: player1,
    ally: player2,
    action: Action.Deathwish,
  };
  activity2 = {
    player: player2,
    ally: player1,
    action: Action.Deathwish,
  };
  activity3 = {
    player: player3,
    ally: player1,
    action: Action.Deathwish,
  };
  activity4 = {
    player: player4,
    ally: player1,
    action: Action.Deathwish,
  };

  const { actionMatrix } = activitiesToTable([
    activity1,
    activity2,
    activity3,
    activity4,
  ]);
  expect(actionMatrix).toHaveLength(1 + 4);
  expect(actionMatrix).toEqual([
    ['', player1.name, player2.name, player3.name, player4.name],
    [player1.name, Action.Deathwish, '', '', ''],
    [player2.name, '', Action.Deathwish, '', ''],
    [player3.name, '', '', Action.Deathwish, ''],
    [player4.name, '', '', '', Action.Deathwish],
  ]);
});

test('Parry shows correct targets', () => {
  activity1 = {
    player: player1,
    ally: player2,
    action: Action.Parry,
    targets: [player3],
  };
  activity2 = {
    player: player2,
    ally: player1,
    action: Action.Parry,
    targets: [player3],
  };
  activity3 = {
    player: player3,
    ally: player1,
    action: Action.Parry,
    targets: [player2],
  };
  activity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player1],
  };

  const { actionMatrix } = activitiesToTable([
    activity1,
    activity2,
    activity3,
    activity4,
  ]);
  expect(actionMatrix).toEqual([
    ['', player1.name, player2.name, player3.name, player4.name],
    [player1.name, '', '', Action.Parry, ''],
    [player2.name, '', '', Action.Parry, ''],
    [player3.name, '', Action.Parry, '', ''],
    [player4.name, Action.Parry, '', '', ''],
  ]);
});

test('Slash correctly shows DMG amounts', () => {
  player1.dmg = 2;
  activity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
  };
  activity2 = {
    player: player2,
    ally: player1,
    action: Action.Slash,
    targets: [player3],
  };
  activity3 = {
    player: player3,
    ally: player1,
    action: Action.Slash,
    targets: [player2],
  };
  activity4 = {
    player: player4,
    ally: player1,
    action: Action.Slash,
    targets: [player1],
  };

  const { actionMatrix } = activitiesToTable([
    activity1,
    activity2,
    activity3,
    activity4,
  ]);
  expect(actionMatrix).toEqual([
    ['', player1.name, player2.name, player3.name, player4.name],
    [player1.name, '', '', `${Action.Slash} (2)`, ''],
    [player2.name, '', '', `${Action.Slash} (1)`, ''],
    [player3.name, '', `${Action.Slash} (1)`, '', ''],
    [player4.name, `${Action.Slash} (1)`, '', '', ''],
  ]);
});

test('Throwing Knives correctly shows on both targets', () => {
  activity1 = {
    player: player1,
    ally: player2,
    action: Action.ThrowingKnives,
    targets: [player3, player4],
  };
  activity2 = {
    player: player2,
    ally: player1,
    action: Action.Parry,
    targets: [player3],
  };
  activity3 = {
    player: player3,
    ally: player1,
    action: Action.Parry,
    targets: [player2],
  };
  activity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player1],
  };

  const { actionMatrix } = activitiesToTable([
    activity1,
    activity2,
    activity3,
    activity4,
  ]);
  expect(actionMatrix).toEqual([
    ['', player1.name, player2.name, player3.name, player4.name],
    [player1.name, '', '', Action.ThrowingKnives, Action.ThrowingKnives],
    [player2.name, '', '', Action.Parry, ''],
    [player3.name, '', Action.Parry, '', ''],
    [player4.name, Action.Parry, '', '', ''],
  ]);
});

test('Ally matrix returns true on successful alliances, false on unsuccessful', () => {
  activity1 = {
    player: player1,
    ally: player2,
    action: Action.Deathwish,
  };
  activity2 = {
    player: player2,
    ally: player1,
    action: Action.Deathwish,
  };
  activity3 = {
    player: player3,
    ally: player1,
    action: Action.Deathwish,
  };
  activity4 = {
    player: player4,
    ally: player1,
    action: Action.Deathwish,
  };

  const { allyMatrix } = activitiesToTable([
    activity1,
    activity2,
    activity3,
    activity4,
  ]);
  expect(allyMatrix).toHaveLength(1 + 4);
  expect(allyMatrix).toEqual([
    ['', player1.name, player2.name, player3.name, player4.name],
    [player1.name, '-', true, '', ''],
    [player2.name, true, '-', '', ''],
    [player3.name, false, '', '-', ''],
    [player4.name, false, '', '', '-'],
  ]);
});

test('Handles Mexican Standoff actions', () => {
  activity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player3],
  };
  activity2 = {
    player: player2,
    action: Action.Parry,
    targets: [player3],
  };
  activity3 = {
    player: player3,
    action: Action.Deathwish,
  };
  const { actionMatrix } = activitiesToTable([activity1, activity2, activity3]);

  expect(actionMatrix).toEqual([
    ['', player1.name, player2.name, player3.name],
    [player1.name, '', '', `${Action.Slash} (2)`],
    [player2.name, '', '', Action.Parry],
    [player3.name, '', '', Action.Deathwish],
  ]);
});
