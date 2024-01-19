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
