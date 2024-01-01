import { Action, ActivityChecked } from '../types/types';
import { Player } from './Player';
import resolveBackstabPenParries from './resolveBackstabsPenParries';

let player1: Player;
let player2: Player;
let player3: Player;
let player4: Player;

let checkedActivity1: ActivityChecked;
let checkedActivity2: ActivityChecked;
let checkedActivity3: ActivityChecked;
let checkedActivity4: ActivityChecked;

let livingPlayers: Player[];
let deadPlayers: Player[];

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
  player4 = new Player('02468', 'Ryan');

  deadPlayers = [];
});

test('Player who backstabs receives a solo kill', () => {
  livingPlayers = [player1, player2, player3, player4];
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Backstab,
    targets: [player2],
    finalAction: Action.Backstab,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Parry,
    targets: [player3],
    finalAction: Action.Parry,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Parry,
    targets: [player2],
    finalAction: Action.Parry,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player3],
    finalAction: Action.Parry,
    successfulAlly: false,
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    resolveBackstabPenParries(livingPlayers, deadPlayers, [
      checkedActivity1,
      checkedActivity2,
      checkedActivity3,
      checkedActivity4,
    ]);

  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
  expect(
    updatedLivingPlayers.find((livingPlayer) => livingPlayer.id === player1.id)
      ?.soloKills,
  ).toHaveLength(1);
});
test('Player who penultimate parries unsuccessfully dies', () => {
  livingPlayers = [player1, player2, player3, player4];
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.PenultimateParry,
    targets: [player2],
    finalAction: Action.PenultimateParry,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Parry,
    targets: [player3],
    finalAction: Action.Parry,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Parry,
    targets: [player2],
    finalAction: Action.Parry,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player3],
    finalAction: Action.Parry,
    successfulAlly: false,
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    resolveBackstabPenParries(livingPlayers, deadPlayers, [
      checkedActivity1,
      checkedActivity2,
      checkedActivity3,
      checkedActivity4,
    ]);

  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
});
test('Player who backstabs a player who penultimate parries them dies', () => {
  livingPlayers = [player1, player2, player3, player4];
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.PenultimateParry,
    targets: [player2],
    finalAction: Action.PenultimateParry,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Backstab,
    targets: [player1],
    finalAction: Action.Backstab,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Parry,
    targets: [player2],
    finalAction: Action.Parry,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player3],
    finalAction: Action.Parry,
    successfulAlly: false,
  };
  const { updatedLivingPlayers, updatedDeadPlayers } =
    resolveBackstabPenParries(livingPlayers, deadPlayers, [
      checkedActivity1,
      checkedActivity2,
      checkedActivity3,
      checkedActivity4,
    ]);

  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
  expect(
    updatedLivingPlayers.find((livingPlayer) => livingPlayer.id === player1.id)
      ?.soloKills,
  ).toHaveLength(1);
});
