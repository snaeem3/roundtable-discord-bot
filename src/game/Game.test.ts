import { Action, GamePhase } from '../types/types';
import { Game } from './Game';
import { Player } from './Player';

let game: Game;
let player1: Player;
let player2: Player;
let player3: Player;
let player4: Player;

beforeEach(() => {
  game = new Game();
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
  player4 = new Player('02468', 'Ryan');
});

test('Player can not join game not initiated', () => {
  const [result, msg] = game.joinGame(player1);
  expect(result).toBeFalsy();
  expect(msg).toBe('Game not initiated');
  expect(game.gameStatus.livingPlayers).toHaveLength(0);
});

test('Player can not rejoin a game', () => {
  game.initiateGame();
  game.joinGame(player1);
  const [result, msg] = game.joinGame(player1);
  expect(result).toBeFalsy();
  expect(msg).toBe(`${player1.name} has already joined and is alive`);
  expect(game.gameStatus.livingPlayers).toHaveLength(1);
});

test('Round can not begin until there are at least 2 players', () => {
  game.initiateGame();
  game.joinGame(player1);
  const [result, msg] = game.beginDiscussionPhase();
  expect(result).toBeFalsy();
  expect(msg).toBe(`Not enough players to begin. Current player count: 1`);
});

test('Can not begin a round when discussion phase is currently in progress', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.beginDiscussionPhase();
  const [result, msg] = game.beginDiscussionPhase();
  expect(result).toBeFalsy();
  expect(msg).toBe('Discussion phase already in progress');
});

test("Can successfully submit Truce and Slash Knight's Dilemma actions", () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.beginDiscussionPhase();
  game.currentGamePhase = GamePhase.ActionSubmit;

  const [result1, msg1] = game.submitKnightsDilemma(player1, Action.Truce);
  expect(result1).toBeTruthy();
  expect(msg1).toBe(
    `${player1.name} successfully submitted Knight's Dilemma Action. 1 more action(s) needed to process round results`,
  );

  const [result2, msg2] = game.submitKnightsDilemma(player2, Action.Slash);
  expect(result2).toBeTruthy();
  expect(msg2).toBe(
    `${player2.name} successfully submitted Knight's Dilemma Action. All player actions submitted Round results processed`,
  );
});

test('Renounce not available when players have the same # of kills + unique alliances', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.beginDiscussionPhase();
  game.currentGamePhase = GamePhase.ActionSubmit;

  const [result1, msg1] = game.submitKnightsDilemma(player1, Action.Renounce);
  expect(result1).toBeFalsy();
  expect(msg1).toBe(
    `Renounce unavailable. Both players have a tiebreaker score of 0`,
  );
});

test('Round results not available until all players have submitted their actions', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.beginDiscussionPhase();
  game.currentGamePhase = GamePhase.ActionSubmit;
});

test('Both players receive 3 victory points when they both truce', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.beginDiscussionPhase();
  game.currentGamePhase = GamePhase.ActionSubmit;

  game.submitKnightsDilemma(player1, Action.Truce);
  game.submitKnightsDilemma(player2, Action.Truce);

  expect(game.getPlayerInfo(player1.id).victoryPoints).toBe(3);
  expect(game.getPlayerInfo(player2.id).victoryPoints).toBe(3);
});

test('Game ends when both players truce', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.beginDiscussionPhase();
  game.currentGamePhase = GamePhase.ActionSubmit;

  game.submitKnightsDilemma(player1, Action.Truce);
  game.submitKnightsDilemma(player2, Action.Truce);

  expect(game.gameComplete).toBeTruthy();
});

test('Both players receive 0 victory points when they both slash and game ends', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.currentGamePhase = GamePhase.ActionSubmit;

  game.submitKnightsDilemma(player1, Action.Slash);
  game.submitKnightsDilemma(player2, Action.Slash);

  expect(game.getPlayerInfo(player1.id).victoryPoints).toBe(0);
  expect(game.getPlayerInfo(player2.id).victoryPoints).toBe(0);
  expect(game.gameComplete).toBeTruthy();
});

test('Slashing player receives 5 victory points and Trucing player receives 0 victory points', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.currentGamePhase = GamePhase.ActionSubmit;

  game.submitKnightsDilemma(player1, Action.Slash);
  game.submitKnightsDilemma(player2, Action.Truce);

  expect(game.getPlayerInfo(player1.id).victoryPoints).toBe(5);
  expect(game.getPlayerInfo(player2.id).victoryPoints).toBe(0);
  expect(game.gameComplete).toBeTruthy();
});

test("Knight's dilemma not available when more than 2 players are alive", () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.currentGamePhase = GamePhase.ActionSubmit;

  const [success, msg] = game.submitKnightsDilemma(player1, Action.Slash);

  expect(success).toBeFalsy();
  expect(msg).toBe('More than 2 players are alive. Current player count: 3');
});

test('Mexican standoff not available when more than 3 players are alive', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.currentGamePhase = GamePhase.ActionSubmit;

  const [success, msg] = game.submitMexicanStandoff(
    player1,
    Action.Slash,
    player2,
  );
  expect(success).toBeFalsy();
  expect(msg).toBe(
    'Incorrect player count for Mexican Standoff. Current player count: 4',
  );
});

test('Mexican standoff not available when less than 3 players are alive', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.currentGamePhase = GamePhase.ActionSubmit;

  const [success, msg] = game.submitMexicanStandoff(
    player1,
    Action.Slash,
    player2,
  );
  expect(success).toBeFalsy();
  expect(msg).toBe(
    'Incorrect player count for Mexican Standoff. Current player count: 2',
  );
});

test('Mexican Standoff slash must include a target', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.currentGamePhase = GamePhase.ActionSubmit;

  const [success, msg] = game.submitMexicanStandoff(player1, Action.Slash);
  expect(success).toBeFalsy();
  expect(msg).toBe('slash requires a target');
});

test('Mexican Standoff parry must include a target', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.currentGamePhase = GamePhase.ActionSubmit;

  const [success, msg] = game.submitMexicanStandoff(player1, Action.Parry);
  expect(success).toBeFalsy();
  expect(msg).toBe('parry requires a target');
});

// test("Only living players can submit Knight's Dilemma actions");
// test("Player's DMG bonus increments by 1 on an assisted kill");
// test("Player's DMG bonus increments by 2 on an solo kill");
// test('Only living players can submit Mexican Standoff actions');
// test('Player dies upon unsuccessful Mexican Standoff deathwish');
// test(
//   'Player receives 5 victory points upon successful Mexican Standoff deathwish',
// );
// test(
//   '0 kill player successfully solo kills another player upon successful Mexican Standoff slash',
// );
// test('Player ghost status set to true upon death');
