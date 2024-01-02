import { Action, Activity } from '../types/types';
import { Player } from './Player';
import updatePlayers from './updatePlayers';

let player1: Player;
let player2: Player;
let player3: Player;
let player4: Player;

let activity1: Activity;
let activity2: Activity;
let activity3: Activity;
let activity4: Activity;

let livingPlayers: Player[];
let deadPlayers: Player[];

beforeEach(() => {
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
  player4 = new Player('02468', 'Ryan');
  deadPlayers = [];
});

test('Players can successfully ally', () => {
  livingPlayers = [player1, player2, player3];

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
    action: Action.Deathwish,
  };
  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
    ]);

  expect(checkedActivities[0].successfulAlly).toBeTruthy();
  expect(checkedActivities[1].successfulAlly).toBeTruthy();
  expect(checkedActivities[2].successfulAlly).toBeFalsy();
});

test('All players could potentially die from TKs', () => {
  livingPlayers = [player1, player2, player3, player4];

  activity1 = {
    player: player1,
    ally: player2,
    action: Action.ThrowingKnives,
    targets: [player3, player4],
  };
  activity2 = {
    player: player2,
    ally: player1,
    action: Action.ThrowingKnives,
    targets: [player3, player4],
  };
  activity3 = {
    player: player3,
    ally: player4,
    action: Action.ThrowingKnives,
    targets: [player1, player2],
  };
  activity4 = {
    player: player4,
    ally: player3,
    action: Action.ThrowingKnives,
    targets: [player1, player2],
  };

  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
      activity4,
    ]);

  expect(updatedLivingPlayers).toHaveLength(0);
  expect(updatedDeadPlayers).toHaveLength(4);
});

test("Player's DMG bonus increments by 1 on an assisted kill", () => {
  livingPlayers = [player1, player2, player3, player4];

  activity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player2],
    ally: player4,
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player3],
    ally: player4,
  };
  activity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player4],
    ally: player1,
  };
  activity4 = {
    player: player4,
    action: Action.Slash,
    targets: [player2],
    ally: player3,
  };

  expect(player1.dmg).toBe(1);

  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
      activity4,
    ]);

  const player1Index = updatedLivingPlayers.findIndex(
    (livingPlayer) => livingPlayer.id === player1.id,
  );
  player1 = updatedLivingPlayers[player1Index];
  expect(player1.dmg).toBe(2);
  expect(player1.assistedKills).toHaveLength(1);
});
// test("Player's DMG bonus increments by 2 on an solo kill");
test('Player ghost status set to true upon death', () => {
  livingPlayers = [player1, player2, player3, player4];

  activity1 = {
    player: player1,
    action: Action.Slash,
    targets: [player2],
    ally: player4,
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player3],
    ally: player4,
  };
  activity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player4],
    ally: player1,
  };
  activity4 = {
    player: player4,
    action: Action.Slash,
    targets: [player2],
    ally: player3,
  };

  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
      activity4,
    ]);
  expect(updatedDeadPlayers).toHaveLength(1);
  expect(
    updatedDeadPlayers.find((deadPlayer) => deadPlayer.id === player2.id)
      ?.ghost,
  ).toBeTruthy();
});

test('Player who successfully Parries receives 1 solo kill', () => {
  livingPlayers = [player1, player2, player3, player4];

  activity1 = {
    player: player1,
    action: Action.Parry,
    targets: [player2],
    ally: player4,
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player1],
    ally: player4,
  };
  activity3 = {
    player: player3,
    action: Action.Parry,
    targets: [player1],
    ally: player1,
  };
  activity4 = {
    player: player4,
    action: Action.Parry,
    targets: [player1],
    ally: player3,
  };

  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
      activity4,
    ]);

  expect(updatedLivingPlayers).toHaveLength(3);
  expect(updatedDeadPlayers).toHaveLength(1);
  expect(
    updatedLivingPlayers.find((livingPlayer) => livingPlayer.id === player1.id)
      ?.soloKills,
  ).toHaveLength(1);
});

test('Player who successfully Parries can still die from slashDMG', () => {
  livingPlayers = [player1, player2, player3, player4];

  activity1 = {
    player: player1,
    action: Action.Parry,
    targets: [player2],
    ally: player4,
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player1],
    ally: player4,
  };
  activity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player1],
    ally: player1,
  };
  activity4 = {
    player: player4,
    action: Action.Slash,
    targets: [player1],
    ally: player3,
  };

  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
      activity4,
    ]);
  expect(updatedLivingPlayers).toHaveLength(2);
  expect(updatedDeadPlayers).toHaveLength(2);
  expect(updatedLivingPlayers[0].assistedKills).toHaveLength(1);
  expect(updatedLivingPlayers[1].assistedKills).toHaveLength(1);
});

test('Player who successfully Deathwishes receives 3 solo kills and 5 victory points if they are the last player alive', () => {
  livingPlayers = [player1, player2, player3, player4];

  activity1 = {
    player: player1,
    action: Action.Deathwish,
    ally: player4,
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player1],
    ally: player4,
  };
  activity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player1],
    ally: player1,
  };
  activity4 = {
    player: player4,
    action: Action.Slash,
    targets: [player1],
    ally: player3,
  };

  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
      activity4,
    ]);
  expect(updatedDeadPlayers).toHaveLength(3);
  expect(updatedLivingPlayers[0].soloKills).toHaveLength(3);
  expect(updatedLivingPlayers[0].victoryPoints).toBe(5);
});

test('Slashing an unsuccessful Deathwish player does NOT grant an assisted/solo kill', () => {
  livingPlayers = [player1, player2, player3, player4];

  activity1 = {
    player: player1,
    action: Action.Deathwish,
    ally: player4,
  };
  activity2 = {
    player: player2,
    action: Action.Slash,
    targets: [player1],
    ally: player4,
  };
  activity3 = {
    player: player3,
    action: Action.Slash,
    targets: [player1],
    ally: player1,
  };
  activity4 = {
    player: player4,
    action: Action.Parry,
    targets: [player1],
    ally: player3,
  };

  const { updatedLivingPlayers, updatedDeadPlayers, checkedActivities } =
    updatePlayers(livingPlayers, deadPlayers, [
      activity1,
      activity2,
      activity3,
      activity4,
    ]);

  expect(updatedDeadPlayers).toHaveLength(1);
  expect(updatedLivingPlayers[0].assistedKills).toHaveLength(0);
  expect(updatedLivingPlayers[1].assistedKills).toHaveLength(0);
  expect(updatedLivingPlayers[2].assistedKills).toHaveLength(0);
  expect(updatedLivingPlayers[0].soloKills).toHaveLength(0);
  expect(updatedLivingPlayers[1].soloKills).toHaveLength(0);
  expect(updatedLivingPlayers[2].soloKills).toHaveLength(0);
});
