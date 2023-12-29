import { Action, Activity } from '../types/types';
import { Player } from './Player';
import successfulDW from './successfulDeathWish';

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

test('Player can succeed DW in a Mexican Standoff', () => {
  activity1 = { player: player1, action: Action.Deathwish };

  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  activity3 = { player: player3, action: Action.Slash, targets: [player1] };

  const result = successfulDW(player1, [activity1, activity2, activity3]);
  expect(result).toBeTruthy();
});

test('Player can fail DW in a Mexican Standoff', () => {
  activity1 = { player: player1, action: Action.Deathwish };

  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  activity3 = { player: player3, action: Action.Slash, targets: [player2] };

  const result = successfulDW(player1, [activity1, activity2, activity3]);
  expect(result).toBeFalsy();
});

test('Player can succeed DW in a standard round', () => {
  activity1 = { player: player1, action: Action.Deathwish };

  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  activity3 = { player: player3, action: Action.Slash, targets: [player1] };
  activity4 = { player: player4, action: Action.Slash, targets: [player1] };

  const result = successfulDW(player1, [
    activity1,
    activity2,
    activity3,
    activity4,
  ]);
  expect(result).toBeTruthy();
});

test('Player can fail DW in a standard round', () => {
  activity1 = { player: player1, action: Action.Deathwish };

  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  activity3 = { player: player3, action: Action.Slash, targets: [player2] };
  activity4 = { player: player4, action: Action.Slash, targets: [player1] };

  const result = successfulDW(player1, [
    activity1,
    activity2,
    activity3,
    activity4,
  ]);
  expect(result).toBeFalsy();
});
