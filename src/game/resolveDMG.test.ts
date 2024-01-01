import { Action, ActivityChecked } from '../types/types';
import { Player } from './Player';
import resolveDMG from './resolveDMG';

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

test('Player can survive 1 DMG', () => {
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
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
    targets: [player2],
    finalAction: Action.Parry,
    successfulAlly: false,
  };

  player3.addRoundDMG({ amount: 1, type: Action.Slash, originator: player1 });

  livingPlayers = [player1, player2, player3, player4];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3, checkedActivity4],
  );

  expect(updatedLivingPlayers).toHaveLength(4);
  expect(updatedDeadPlayers).toHaveLength(0);
});
test('Player dies from 2 DMG', () => {
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Parry,
    targets: [player4],
    finalAction: Action.Parry,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player2],
    finalAction: Action.Parry,
    successfulAlly: false,
  };

  player3.addRoundDMG({ amount: 1, type: Action.Slash, originator: player1 });
  player3.addRoundDMG({ amount: 1, type: Action.Slash, originator: player2 });

  livingPlayers = [player1, player2, player3, player4];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3, checkedActivity4],
  );

  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
  expect(
    updatedLivingPlayers.find((livingPlayer) => livingPlayer.id === player1.id)
      ?.assistedKills,
  ).toHaveLength(1);
});
test('Allied player can survive 2 DMG', () => {
  player1.addRoundDMG({ amount: 1, type: Action.Slash, originator: player3 });
  player1.addRoundDMG({ amount: 1, type: Action.Slash, originator: player4 });
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Slash,
    targets: [player4],
    finalAction: Action.Slash,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
    successfulAlly: false,
  };

  livingPlayers = [player1, player2, player3, player4];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3, checkedActivity4],
  );
  expect(updatedLivingPlayers).toHaveLength(4);
  expect(updatedDeadPlayers).toHaveLength(0);
});
test('Player with 2 DMG slash can solo kill an unallied player', () => {
  player1.addRoundDMG({ amount: 1, type: Action.Slash, originator: player3 });
  player3.addRoundDMG({ amount: 2, type: Action.Slash, originator: player1 });
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Parry,
    targets: [player4],
    finalAction: Action.Parry,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player1],
    finalAction: Action.Parry,
    successfulAlly: false,
  };

  livingPlayers = [player1, player2, player3, player4];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3, checkedActivity4],
  );
  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
  expect(
    updatedLivingPlayers.find((livingPlayer) => livingPlayer.id === player1.id)
      ?.soloKills,
  ).toHaveLength(1);
});
test('Allied player with 2 Round DMG received survives', () => {
  player1.addRoundDMG({ amount: 2, type: Action.Slash, originator: player3 });
  player3.addRoundDMG({ amount: 1, type: Action.Slash, originator: player1 });
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Parry,
    targets: [player4],
    finalAction: Action.Parry,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player1],
    finalAction: Action.Parry,
    successfulAlly: false,
  };

  livingPlayers = [player1, player2, player3, player4];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3, checkedActivity4],
  );
  expect(updatedLivingPlayers).toHaveLength(4);
  expect(updatedDeadPlayers).toHaveLength(0);
});
test('Allied player1 with 1 DMG receives survives, but allied player2 with 3 DMG receives dies', () => {
  player1.addRoundDMG({ amount: 1, type: Action.Slash, originator: player3 });
  player2.addRoundDMG({ amount: 3, type: Action.Slash, originator: player4 });
  player3.addRoundDMG({ amount: 1, type: Action.Slash, originator: player1 });
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
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
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
    successfulAlly: false,
  };

  livingPlayers = [player1, player2, player3, player4];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3, checkedActivity4],
  );
  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
});
test('Allied player with 4 Round DMG received dies', () => {
  player1.addRoundDMG({ amount: 4, type: Action.Slash, originator: player3 });
  player3.addRoundDMG({ amount: 1, type: Action.Slash, originator: player1 });
  checkedActivity1 = {
    player: player1,
    ally: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
    successfulAlly: true,
  };
  checkedActivity2 = {
    player: player2,
    ally: player1,
    action: Action.Parry,
    targets: [player4],
    finalAction: Action.Parry,
    successfulAlly: true,
  };
  checkedActivity3 = {
    player: player3,
    ally: player1,
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
    successfulAlly: false,
  };
  checkedActivity4 = {
    player: player4,
    ally: player1,
    action: Action.Parry,
    targets: [player1],
    finalAction: Action.Parry,
    successfulAlly: false,
  };

  livingPlayers = [player1, player2, player3, player4];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3, checkedActivity4],
  );
  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
});

test('Everyone could die in Mexican standoff', () => {
  player1.addRoundDMG({ amount: 2, type: Action.Slash, originator: player3 });
  player2.addRoundDMG({ amount: 2, type: Action.Slash, originator: player1 });
  player3.addRoundDMG({ amount: 2, type: Action.Slash, originator: player2 });
  checkedActivity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player2],
    finalAction: Action.Slash,
  };
  checkedActivity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player3],
    finalAction: Action.Slash,
  };
  checkedActivity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player1],
    finalAction: Action.Slash,
  };

  livingPlayers = [player1, player2, player3];

  const { updatedLivingPlayers, updatedDeadPlayers } = resolveDMG(
    livingPlayers,
    deadPlayers,
    [checkedActivity1, checkedActivity2, checkedActivity3],
  );
  expect(updatedLivingPlayers).toHaveLength(0);
  expect(updatedDeadPlayers).toHaveLength(3);
});
