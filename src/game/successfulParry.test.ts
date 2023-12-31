import { Action, Activity } from '../types/types';
import { Player } from './Player';
import successfulParry from './successfulParry';

let player1: Player;
let player2: Player;

let activity1: Activity;
let activity2: Activity;

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
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

test('Throws an error if player did not Parry', () => {
  activity1 = { player: player1, action: Action.Slash, targets: [player2] };
  activity2 = { player: player2, action: Action.Slash, targets: [player1] };
  //   const result = successfulParry(player1, player2, [activity1, activity2]);

  expect(() =>
    successfulParry(player1, player2, [activity1, activity2]),
  ).toThrow(`${player1.name} did not parry`);
});
