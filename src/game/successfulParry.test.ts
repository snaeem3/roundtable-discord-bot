import { Action, Activity } from '../types/types';
import { Player } from './Player';
import successfulParry from './successfulParry';

let player1: Player;
let player2: Player;
let player3: Player;

let activity1: Activity;
let activity2: Activity;
let activity3: Activity;

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
});

test('Returns true on successful Parry', () => {
  activity1 = { player: player1, action: Action.Parry, targets: [player2] };
  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  const result = successfulParry(player1, player2, [activity1, activity2]);

  expect(result).toBeTruthy();
});

test('Returns false on unsuccessful Parry', () => {
  activity1 = { player: player1, action: Action.Parry, targets: [player2] };
  activity2 = { player: player2, action: Action.Parry, targets: [player1] };
  const result = successfulParry(player1, player2, [activity1, activity2]);

  expect(result).toBeFalsy();
});

test('Player successfully parries, but returns false on another unsuccessful Parry', () => {
  activity1 = { player: player1, action: Action.Parry, targets: [player2] };
  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  activity3 = { player: player3, action: Action.Slash, targets: [player1] };

  const result1 = successfulParry(player1, player2, [
    activity1,
    activity2,
    activity3,
  ]);
  const result2 = successfulParry(player1, player3, [
    activity1,
    activity2,
    activity3,
  ]);

  expect(result1).toBeTruthy();
  expect(result2).toBeFalsy();
});

test('Throws an error if player did not Parry', () => {
  activity1 = { player: player1, action: Action.Slash, targets: [player2] };
  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  //   const result = successfulParry(player1, player2, [activity1, activity2]);

  expect(() =>
    successfulParry(player1, player2, [activity1, activity2]),
  ).toThrow(`${player1.name} did not parry`);
});
