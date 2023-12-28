import { Action, Activity, ActivityChecked, GamePhase } from '../types/types';
import { Player } from './Player';

export class Game {
  gameInitiated: boolean;

  livingPlayers: Player[];

  deadPlayers: Player[];

  currentPhase: GamePhase;

  gameComplete: boolean;

  roundResults: [];

  currentRoundActivity: Activity[];

  constructor() {
    this.gameInitiated = false;
    this.livingPlayers = [];
    this.deadPlayers = [];
    this.currentPhase = GamePhase.None;
    this.gameComplete = false;
    this.roundResults = [];
    this.currentRoundActivity = [];
  }

  public get gameStatus() {
    return {
      gameInitiated: this.gameInitiated,
      livingPlayers: this.livingPlayers,
      deadPlayers: this.deadPlayers,
      currentPhase: this.currentPhase,
      gameComplete: this.gameComplete,
      roundResults: this.roundResults,
    };
  }

  public get recentRoundResult() {
    return this.roundResults.slice(-1); // last element of array
  }

  public get currentRoundNum() {
    return this.roundResults.length;
  }

  public getPlayerInfo(playerId: string) {
    let index = this.livingPlayers.findIndex(
      (player) => player.id === playerId,
    );

    if (index === -1) {
      index = this.deadPlayers.findIndex((player) => player.id === playerId);
    } else {
      return this.livingPlayers[index];
    }

    if (index === -1) {
      throw new Error(`${playerId} not found`);
    } else {
      return this.deadPlayers[index];
    }
  }

  public initiateGame() {
    this.gameInitiated = true;
    this.currentPhase = GamePhase.Setup;
    return [true, 'Game Initiated'];
  }

  public resetGame() {
    this.gameInitiated = false;
    this.livingPlayers = [];
    this.deadPlayers = [];
    return [true, 'Game Reset'];
  }

  public joinGame(player: Player) {
    // if game hasn't been initiated
    if (!this.gameInitiated) return [false, 'Game not initiated'];

    // if game already started
    if (this.currentPhase !== GamePhase.Setup) {
      return [
        false,
        `Can only join during setup. Current game phase: ${this.currentPhase}`,
      ];
    }

    // if player hasn't already joined
    if (
      this.livingPlayers.find((livingPlayer) => livingPlayer.id === player.id)
    ) {
      return [false, `${player.name} has already joined and is alive`];
    }

    if (this.deadPlayers.find((deadPlayer) => deadPlayer.id === player.id)) {
      return [false, `${player.name} has already joined and is dead`];
    }

    this.livingPlayers.push(player);

    return [true, `${player.name} has successfully joined the game`];
  }

  public set currentGamePhase(phase: GamePhase) {
    this.currentPhase = phase;
  }

  public beginDiscussionPhase(time?: number) {
    if (!this.gameInitiated) return [false, 'No game in progress'];

    if (this.currentPhase === GamePhase.Discussion)
      return [false, 'Discussion phase already in progress'];

    if (this.livingPlayers.length < 2)
      return [
        false,
        `Not enough players to begin. Current player count: ${this.livingPlayers.length}`,
      ];

    this.currentPhase = GamePhase.Discussion;

    return [true, 'Round begins'];
  }

  public submitKnightsDilemma(player: Player, action: Action) {
    const [preCheckPass, preCheckMsg] = this.actionPreCheck(player);

    if (!preCheckPass) return [false, preCheckMsg];

    if (this.livingPlayers.length > 2) {
      return [
        false,
        `More than 2 players are alive. Current player count: ${this.livingPlayers.length}`,
      ];
    }

    if (
      !(
        action === Action.Truce ||
        action === Action.Slash ||
        action === Action.Renounce
      )
    ) {
      return [
        false,
        "Truce, Slash, and Renounce are the only valid actions in Knight's Dilemma",
      ];
    }

    if (
      action === Action.Renounce &&
      this.livingPlayers[0].tieBreakerScore ===
        this.livingPlayers[1].tieBreakerScore
    ) {
      return [
        false,
        `Renounce unavailable. Both players have a tiebreaker score of ${this.livingPlayers[0].tieBreakerScore}`,
      ];
    }

    // Add activity to currentRoundActivity array
    this.currentRoundActivity.push({ player, action });

    if (this.currentRoundActivity.length === this.livingPlayers.length) {
      this.processRoundResults();
      return [
        true,
        `${player.name} successfully submitted Knight's Dilemma Action. All player actions submitted Round results processed`,
      ];
    }

    return [
      true,
      `${player.name} successfully submitted Knight's Dilemma Action. ${
        this.livingPlayers.length - this.currentRoundActivity.length
      } more action(s) needed to process round results`,
    ];
  }

  public submitMexicanStandoff(
    player: Player,
    action: Action,
    target?: Player,
  ) {
    const [preCheckPass, preCheckMsg] = target
      ? this.actionPreCheck(player, [target])
      : this.actionPreCheck(player);
    if (!preCheckPass) return [false, preCheckMsg];

    if (this.livingPlayers.length !== 3) {
      return [
        false,
        `Incorrect player count for Mexican Standoff. Current player count: ${this.livingPlayers.length}`,
      ];
    }

    if (
      !(
        action === Action.Parry ||
        action === Action.Slash ||
        action === Action.Deathwish
      )
    ) {
      return [
        false,
        'Parry, Slash, and Deathwish are the only valid actions in a Mexican Standoff',
      ];
    }

    // Ensure Slash and Parry have a target
    if (
      (action === Action.Parry || action === Action.Slash) &&
      target === undefined
    ) {
      return [false, `${action} requires a target`];
    }

    // Add activity to currentRoundActivity array
    this.currentRoundActivity.push({ player, action });

    if (this.currentRoundActivity.length === this.livingPlayers.length) {
      this.processRoundResults();
      return [
        true,
        `${player.name} successfully submitted Mexican Standoff Action. All player actions submitted Round results processed`,
      ];
    }

    return [
      true,
      `${player.name} successfully submitted Mexican Standoff Action. ${
        this.livingPlayers.length - this.currentRoundActivity.length
      } more action(s) needed to process round results`,
    ];
  }

  processRoundResults() {
    if (!this.gameInitiated) return [false, 'No game in progress'];

    if (this.gameComplete) return [false, 'Game is complete'];

    this.currentGamePhase = GamePhase.ActionResolve;

    const numSubmittedActions = this.currentRoundActivity.length;
    if (numSubmittedActions < this.livingPlayers.length)
      return [
        false,
        `${
          this.livingPlayers.length - numSubmittedActions
        } living player(s) still need to submit an action/ally`,
      ];

    // Knight's Dilemma
    if (this.livingPlayers.length === 2) {
      const player0Action = this.currentRoundActivity[0].action;
      const player1Action = this.currentRoundActivity[1].action;
      if (
        player0Action === Action.Renounce ||
        player1Action === Action.Renounce
      ) {
        if (
          this.livingPlayers[0].tieBreakerScore >
          this.livingPlayers[1].tieBreakerScore
        ) {
          this.livingPlayers[0].victoryPoints += 2;
          this.livingPlayers[1].victoryPoints += 1;
        } else {
          this.livingPlayers[0].victoryPoints += 1;
          this.livingPlayers[1].victoryPoints += 2;
        }
      } else if (
        player0Action === Action.Truce &&
        player1Action === Action.Truce
      ) {
        this.livingPlayers[0].victoryPoints += 3;
        this.livingPlayers[1].victoryPoints += 3;
      } else if (
        player0Action === Action.Slash &&
        player1Action === Action.Truce
      ) {
        this.livingPlayers[0].victoryPoints += 5;
      } else if (
        player0Action === Action.Truce &&
        player1Action === Action.Slash
      ) {
        this.livingPlayers[1].victoryPoints += 5;
      } // else both players slashed

      this.gameComplete = true;
    }
  }

  actionPreCheck(player: Player, targets?: Player[]) {
    if (!this.gameInitiated) return [false, 'No game in progress'];

    if (this.gameComplete) return [false, 'Game is complete'];

    if (this.currentPhase !== GamePhase.ActionSubmit) {
      return [
        false,
        `Can only submit during Action Submit Phase. Current Game Phase: ${this.currentGamePhase}`,
      ];
    }

    // Check if player already submitted an action
    const index = this.currentRoundActivity.findIndex(
      (activity) => activity.player.id === player.id,
    );

    if (index !== -1)
      return [false, `${player.name} has already submitted an action`];

    // Check if all targets are valid living players
    if (targets) {
      targets.forEach((target) => {
        if (
          !this.livingPlayers.find(
            (livingPlayer) => livingPlayer.id === targets[0].id,
          )
        ) {
          return [false, `${target.name} is not alive`];
        }
      });
    }

    return [true, 'Action successfully pre-checked'];
  }

  clearRoundActivity() {
    this.currentRoundActivity = [];
  }
}
