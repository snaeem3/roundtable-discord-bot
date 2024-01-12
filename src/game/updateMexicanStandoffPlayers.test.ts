import { Action, Activity } from '../types/types';
import { Player } from './Player';
import updateMexicanStandoffPlayers from './updateMexicanStandoffPlayers';

let player1: Player;
let player2: Player;
let player3: Player;

let activity1: Activity;
let activity2: Activity;
let activity3: Activity;

let livingPlayers: [Player, Player, Player];
let deadPlayers: Player[];

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
  livingPlayers = [player1, player2, player3];
  deadPlayers = [];
});

test('Player receives 5 victory points upon successful Mexican Standoff deathwish', () => {
  activity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player3],
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player3],
  };
  activity3 = {
    player: player3,
    action: Action.Deathwish,
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    updateMexicanStandoffPlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
    ]);

  expect(updatedLivingPlayers).toHaveLength(1);
  expect(updatedDeadPlayers).toHaveLength(2);
});

test('All players can die from slash in Mexican Standoff', () => {
  activity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player2],
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player3],
  };
  activity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player1],
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    updateMexicanStandoffPlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
    ]);

  expect(updatedLivingPlayers).toHaveLength(0);
  expect(updatedDeadPlayers).toHaveLength(3);
});

test('Player dies upon unsuccessful Mexican standoff deathwish', () => {
  activity1 = {
    player: player1,
    action: Action.Deathwish,
  };
  activity2 = {
    player: player2,
    action: Action.Parry,
    targets: [player1],
  };
  activity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player1],
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    updateMexicanStandoffPlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
    ]);

  expect(updatedDeadPlayers).toHaveLength(1);
  expect(updatedDeadPlayers[0].id).toBe(player1.id);
});

test('If 2 players slash each other, the remaining player earns 5 victory points', () => {
  activity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player2],
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player1],
  };
  activity3 = {
    player: player3,
    action: Action.Parry,
    targets: [player1],
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    updateMexicanStandoffPlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
    ]);

  expect(updatedLivingPlayers).toHaveLength(1);
  expect(updatedLivingPlayers[0].victoryPoints).toBe(5);
});

test('Player can die from Parry in Mexican Standoff', () => {
  activity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player2],
  };
  activity2 = {
    player: player2,
    action: Action.Parry,
    targets: [player1],
  };
  activity3 = {
    player: player3,
    action: Action.Parry,
    targets: [player1],
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    updateMexicanStandoffPlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
    ]);
  expect(updatedLivingPlayers).toHaveLength(2);
  expect(updatedDeadPlayers[0].id).toBe(player1.id);
});

test('All players can die from triple unsuccessful deathwish', () => {
  activity1 = {
    player: player1,
    action: Action.Deathwish,
  };
  activity2 = {
    player: player2,
    action: Action.Deathwish,
  };
  activity3 = {
    player: player3,
    action: Action.Deathwish,
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    updateMexicanStandoffPlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
    ]);

  expect(updatedLivingPlayers).toHaveLength(0);
  expect(updatedDeadPlayers).toHaveLength(3);
});
