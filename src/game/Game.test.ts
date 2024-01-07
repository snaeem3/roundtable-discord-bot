import { Action, GamePhase } from '../types/types';
import { Game } from './Game';
import { Player } from './Player';

let game: Game;
let player1: Player;
let player2: Player;
let player3: Player;
let player4: Player;
let player5: Player;

beforeEach(() => {
  game = new Game();
  player1 = new Player('01234', 'John');
  player2 = new Player('56789', 'Sarah');
  player3 = new Player('13579', 'George');
  player4 = new Player('02468', 'Ryan');
  player5 = new Player('36912', 'Paul');
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

test('Game results not available until game is complete', () => {
  expect(game.gameResults).toBe('Game not yet complete');
  game.initiateGame();
  expect(game.gameResults).toBe('Game not yet complete');
  game.joinGame(player1);
  game.joinGame(player2);
  game.beginDiscussionPhase();
  expect(game.gameResults).toBe('Game not yet complete');
  game.currentPhase = GamePhase.ActionSubmit;
  expect(game.gameResults).toBe('Game not yet complete');
});

describe("Knight's Dilemma Tests", () => {
  test("Can successfully submit Truce and Slash Knight's Dilemma actions", () => {
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.beginDiscussionPhase();
    game.currentPhase = GamePhase.ActionSubmit;

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
    game.currentPhase = GamePhase.ActionSubmit;

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
    game.currentPhase = GamePhase.ActionSubmit;
    expect(game.recentRoundResult).toHaveLength(0);
  });

  test('Both players receive 3 victory points when they both truce', () => {
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.beginDiscussionPhase();
    game.currentPhase = GamePhase.ActionSubmit;

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
    game.currentPhase = GamePhase.ActionSubmit;

    game.submitKnightsDilemma(player1, Action.Truce);
    game.submitKnightsDilemma(player2, Action.Truce);

    expect(game.gameComplete).toBeTruthy();
  });

  test('Both players receive 0 victory points when they both slash and game ends', () => {
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.currentPhase = GamePhase.ActionSubmit;

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
    game.currentPhase = GamePhase.ActionSubmit;

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
    game.currentPhase = GamePhase.ActionSubmit;

    const [success, msg] = game.submitKnightsDilemma(player1, Action.Slash);

    expect(success).toBeFalsy();
    expect(msg).toBe('More than 2 players are alive. Current player count: 3');
  });

  test("Game results available after 1 player wins Knight's Dilemma", () => {
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.currentPhase = GamePhase.ActionSubmit;

    game.submitKnightsDilemma(player1, Action.Slash);
    game.submitKnightsDilemma(player2, Action.Truce);

    expect(game.gameResults).toBe(
      `${player1.name} successfully Slashed and is the last knight standing! +5 victory points`,
    );
  });

  test("Game results available after both players truce in Knight's Dilemma", () => {
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.currentPhase = GamePhase.ActionSubmit;

    game.submitKnightsDilemma(player1, Action.Truce);
    game.submitKnightsDilemma(player2, Action.Truce);

    expect(game.gameResults).toBe(
      `${player1.name} and ${player2.name} have agreed to Truce! +3 victory points each` ||
        `${player2.name} and ${player1.name} have agreed to Truce! +3 victory points each`,
    );
  });

  test("Game results available after both players slash in Knight's Dilemma", () => {
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.currentPhase = GamePhase.ActionSubmit;

    game.submitKnightsDilemma(player1, Action.Slash);
    game.submitKnightsDilemma(player2, Action.Slash);

    expect(game.gameResults).toBe(
      `${player1.name} and ${player2.name} have slashed each other! Game ends with no victor!` ||
        `${player2.name} and ${player1.name} have slashed each other! Game ends with no victor!`,
    );
  });

  // Renounce tests
  test('Player can renounce if their tiebreaker score is different from their opponent', () => {
    player1.soloKills.push({ player: player4, method: Action.Backstab });
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.currentPhase = GamePhase.ActionSubmit;

    expect(game.livingPlayers[0].tieBreakerScore).not.toBe(
      game.livingPlayers[1].tieBreakerScore,
    );

    const [success, msg] = game.submitKnightsDilemma(player1, Action.Renounce);
    expect(success).toBeTruthy();
    expect(msg).toBe(
      `${player1.name} successfully submitted Knight's Dilemma Action. 1 more action(s) needed to process round results`,
    );
  });

  test('Renounce awards higher ranked player 2 points and lower ranked player 1 point', () => {
    player1.soloKills.push({ player: player4, method: Action.Backstab });
    game.initiateGame();
    game.joinGame(player1);
    game.joinGame(player2);
    game.currentPhase = GamePhase.ActionSubmit;

    game.submitKnightsDilemma(player1, Action.Renounce);
    game.submitKnightsDilemma(player2, Action.Truce);

    expect(game.gameResults).toBe(
      `Renounced! ${player1.name} earned 2 victory points & ${player2.name}  earned 1 victory point`,
    );
    expect(
      game.livingPlayers[0].victoryPoints + game.livingPlayers[1].victoryPoints,
    ).toBe(3);
  });
});

test('Mexican standoff not available when more than 3 players are alive', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.currentPhase = GamePhase.ActionSubmit;

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
  game.currentPhase = GamePhase.ActionSubmit;

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
  game.currentPhase = GamePhase.ActionSubmit;

  const [success, msg] = game.submitMexicanStandoff(player1, Action.Slash);
  expect(success).toBeFalsy();
  expect(msg).toBe('slash requires a target');
});

test('Mexican Standoff parry must include a target', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.currentPhase = GamePhase.ActionSubmit;

  const [success, msg] = game.submitMexicanStandoff(player1, Action.Parry);
  expect(success).toBeFalsy();
  expect(msg).toBe('parry requires a target');
});

test('Player can not target themselves', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.currentPhase = GamePhase.ActionSubmit;

  let [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.Slash,
    player2,
    [player1],
  );
  expect(success).toBeFalsy();
  expect(msg).toBe('Player may not target themselves');

  [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.ThrowingKnives,
    player2,
    [player3, player1],
  );
  expect(success).toBeFalsy();
  expect(msg).toBe('Player may not target themselves');
});

test('Can only submit living players as allies', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.joinGame(player5);
  game.currentPhase = GamePhase.ActionSubmit;
  game.submitStandardRoundActivity(player1, Action.Slash, player2, [player5]);
  game.submitStandardRoundActivity(player2, Action.Slash, player1, [player5]);
  game.submitStandardRoundActivity(player3, Action.Parry, player1, [player1]);
  game.submitStandardRoundActivity(player4, Action.Parry, player1, [player1]);
  game.submitStandardRoundActivity(player5, Action.Parry, player1, [player4]);

  expect(game.deadPlayers).toHaveLength(1);

  game.newRound();
  game.currentPhase = GamePhase.ActionSubmit;
  const [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.Slash,
    player5,
    [player2],
  );
  expect(success).toBeFalsy();
  expect(msg).toBe(`Submitted ally ${player5.name} is not alive`);
});

test('Only living players can submit actions', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.joinGame(player5);
  game.currentPhase = GamePhase.ActionSubmit;
  game.submitStandardRoundActivity(player1, Action.Slash, player2, [player5]);
  game.submitStandardRoundActivity(player2, Action.Slash, player1, [player5]);
  game.submitStandardRoundActivity(player3, Action.Parry, player1, [player1]);
  game.submitStandardRoundActivity(player4, Action.Parry, player1, [player1]);
  game.submitStandardRoundActivity(player5, Action.Parry, player1, [player4]);

  game.newRound();
  game.currentPhase = GamePhase.ActionSubmit;
  const [success, msg] = game.submitStandardRoundActivity(
    player5,
    Action.Slash,
    player1,
    [player2],
  );
  expect(success).toBeFalsy();
  expect(msg).toBe(`${player5.name} is not a valid living player`);
});

test('Can not submit yourself as an ally', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.currentPhase = GamePhase.ActionSubmit;
  const [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.Slash,
    player1,
    [player2],
  );
  expect(success).toBeFalsy();
  expect(msg).toBe('Player may not ally themselves');
});

test('Throwing Knives must have 2 targets', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.currentPhase = GamePhase.ActionSubmit;
  let [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.ThrowingKnives,
    player2,
  );
  expect(success).toBeFalsy();
  expect(msg).toBe('Throwing Knives requires 2 targets, 0 target(s) received');

  [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.ThrowingKnives,
    player2,
    [player3],
  );
  expect(success).toBeFalsy();
  expect(msg).toBe('Throwing Knives requires 2 targets, 1 target(s) received');
});

test('Slash and Parry must have 1 target', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.currentPhase = GamePhase.ActionSubmit;
  let [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.Slash,
    player2,
  );
  expect(success).toBeFalsy();
  expect(msg).toBe('Slash requires 1 target, 0 target(s) received');

  [success, msg] = game.submitStandardRoundActivity(
    player1,
    Action.Parry,
    player2,
  );
  expect(success).toBeFalsy();
  expect(msg).toBe('Parry requires 1 target, 0 target(s) received');
});

test('On a new round, previous activities are saved and current activities are cleared', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.joinGame(player5);
  game.currentPhase = GamePhase.ActionSubmit;
  game.submitStandardRoundActivity(player1, Action.Slash, player2, [player5]);
  game.submitStandardRoundActivity(player2, Action.ThrowingKnives, player1, [
    player4,
    player5,
  ]);
  game.submitStandardRoundActivity(player3, Action.Parry, player1, [player1]);
  game.submitStandardRoundActivity(player4, Action.Parry, player5, [player1]);
  game.submitStandardRoundActivity(player5, Action.Slash, player4, [player3]);

  expect(game.roundActivity).toHaveLength(0);
  expect(game.currentRoundActivity).toHaveLength(5);

  game.newRound();

  expect(game.roundActivity).toHaveLength(1);
  expect(game.roundActivity[0]).toHaveLength(5);
  expect(game.currentRoundActivity).toHaveLength(0);
});

test('Round damage does not carry over into a new round', () => {
  game.initiateGame();
  game.joinGame(player1);
  game.joinGame(player2);
  game.joinGame(player3);
  game.joinGame(player4);
  game.joinGame(player5);
  game.currentPhase = GamePhase.ActionSubmit;
  game.submitStandardRoundActivity(player1, Action.Slash, player2, [player5]);
  game.submitStandardRoundActivity(player2, Action.ThrowingKnives, player1, [
    player4,
    player5,
  ]);
  game.submitStandardRoundActivity(player3, Action.Parry, player1, [player1]);
  game.submitStandardRoundActivity(player4, Action.Parry, player5, [player1]);
  game.submitStandardRoundActivity(player5, Action.Slash, player4, [player3]);

  game.newRound();
  game.currentPhase = GamePhase.ActionSubmit;

  game.livingPlayers.forEach((livingPlayer) => {
    expect(livingPlayer.roundDmgReceived).toHaveLength(0);
  });
});
