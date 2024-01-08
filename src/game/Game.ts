import {
  Action,
  Activity,
  ActivityChecked,
  GamePhase,
  MexicanStandoffRoundDeaths,
  RoundDeaths,
} from '../types/types';
import { Player } from './Player';
import successfulDW from './successfulDeathWish';
import updateMexicanStandoffPlayers from './updateMexicanStandoffPlayers';
import updatePlayers from './updatePlayers';

export class Game {
  gameInitiated: boolean;

  livingPlayers: Player[];

  deadPlayers: Player[];

  currentPhase: GamePhase;

  gameComplete: boolean;

  roundActivity: Activity[][];

  currentRoundActivity: Activity[];

  roundResults: (RoundDeaths | MexicanStandoffRoundDeaths)[];

  gameResults: string;

  constructor() {
    this.gameInitiated = false;
    this.livingPlayers = [];
    this.deadPlayers = [];
    this.currentPhase = GamePhase.None;
    this.gameComplete = false;
    this.roundResults = [];
    this.roundActivity = [];
    this.currentRoundActivity = [];
    this.gameResults = 'Game not yet complete';
  }

  public get gameStatus() {
    return {
      gameInitiated: this.gameInitiated,
      livingPlayers: this.livingPlayers,
      deadPlayers: this.deadPlayers,
      currentPhase: this.currentPhase,
      gameComplete: this.gameComplete,
      roundResults: this.roundResults,
      roundNumber: this.currentRoundNum,
    };
  }

  public get recentRoundResult() {
    return this.roundResults.slice(-1); // last element of array
  }

  private updateGameResults(renounceWinner?: Player, renounceLoser?: Player) {
    if (this.livingPlayers.length >= 3) return;
    if (this.livingPlayers.length === 1) {
      this.gameComplete = true;
      this.gameResults = `${this.livingPlayers[0].name} is the last knight standing!`;
    } else if (this.livingPlayers.length === 0) {
      this.gameComplete = true;
      this.gameResults = `No knights remaining. Game Over!`;
    } else if (
      this.livingPlayers.length === 2 &&
      renounceWinner &&
      renounceLoser
    ) {
      this.gameComplete = true;
      this.gameResults = `Renounced! ${renounceWinner.name} earned 2 victory points & ${renounceLoser.name}  earned 1 victory point`;
    }
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

  addRoundResult(deaths: RoundDeaths | MexicanStandoffRoundDeaths) {
    this.roundResults.push(deaths);
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

  // public set currentGamePhase(phase: GamePhase) {
  //   this.currentPhase = phase;
  // }

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

  public submitKnightsDilemma(
    player: Player,
    action: Action.Truce | Action.Slash | Action.Renounce,
  ) {
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
    action: Action.Slash | Action.Parry | Action.Deathwish,
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
      this.currentPhase = GamePhase.ActionResolve;
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

  public submitStandardRoundActivity(
    player: Player,
    action:
      | Action.Slash
      | Action.Parry
      | Action.Deathwish
      | Action.ThrowingKnives,
    ally: Player,
    targets?: [Player] | [Player, Player],
  ) {
    const [preCheckPass, preCheckMsg] = this.actionPreCheck(
      player,
      targets,
      ally,
    );
    if (!preCheckPass) return [false, preCheckMsg];

    if (
      !(
        action === Action.Parry ||
        action === Action.Slash ||
        action === Action.Deathwish ||
        action === Action.ThrowingKnives
      )
    ) {
      return [
        false,
        'Parry, Slash, Deathwish, and Throwing Knives are the only valid actions in a standard round.',
      ];
    }

    if (action === Action.ThrowingKnives && targets === undefined)
      return [
        false,
        'Throwing Knives requires 2 targets, 0 target(s) received',
      ];

    if (action === Action.Slash && targets === undefined)
      return [false, 'Slash requires 1 target, 0 target(s) received'];

    if (action === Action.Parry && targets === undefined)
      return [false, 'Parry requires 1 target, 0 target(s) received'];

    if (action === Action.ThrowingKnives && targets?.length !== 2)
      return [
        false,
        `Throwing Knives requires 2 targets, ${targets?.length} target(s) received`,
      ];

    this.currentRoundActivity.push({ player, action, ally, targets });

    if (this.currentRoundActivity.length === this.livingPlayers.length) {
      this.processRoundResults();
      this.currentPhase = GamePhase.ActionResolve;
      return [
        true,
        `${player.name} successfully submitted a Standard Round Action. All player actions submitted. Round results processed`,
      ];
    }

    return [
      true,
      `${player.name} successfully submitted a Standard Round Action. ${
        this.livingPlayers.length - this.currentRoundActivity.length
      } more action(s) needed to process round results`,
    ];
  }

  processRoundResults() {
    if (!this.gameInitiated) return [false, 'No game in progress'];

    if (this.gameComplete) return [false, 'Game is complete'];

    this.currentPhase = GamePhase.ActionResolve;

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
          this.updateGameResults(this.livingPlayers[0], this.livingPlayers[1]);
        } else {
          this.livingPlayers[0].victoryPoints += 1;
          this.livingPlayers[1].victoryPoints += 2;
          this.updateGameResults(this.livingPlayers[1], this.livingPlayers[0]);
        }
      } else if (
        player0Action === Action.Truce &&
        player1Action === Action.Truce
      ) {
        this.livingPlayers[0].victoryPoints += 3;
        this.livingPlayers[1].victoryPoints += 3;
        this.gameResults = `${this.livingPlayers[0].name} and ${this.livingPlayers[1].name} have agreed to Truce! +3 victory points each`;
      } else if (
        player0Action === Action.Slash &&
        player1Action === Action.Truce
      ) {
        this.livingPlayers[0].victoryPoints += 5;
        this.gameResults = `${this.livingPlayers[0].name} successfully Slashed and is the last knight standing! +5 victory points`;
      } else if (
        player0Action === Action.Truce &&
        player1Action === Action.Slash
      ) {
        this.livingPlayers[1].victoryPoints += 5;
        this.gameResults = `${this.livingPlayers[1].name} successfully Slashed and is the last knight standing! +5 victory points`;
      } else {
        // both players slashed
        this.gameResults = `${this.livingPlayers[0].name} and ${this.livingPlayers[1].name} have slashed each other! Game ends with no victor!`;
      }

      this.gameComplete = true;
      return [true, "Knight's Dilemma successfully finished"];
    }

    // Mexican Standoff
    if (this.livingPlayers.length === 3) {
      const mexicanStandoffUpdates = updateMexicanStandoffPlayers(
        [this.livingPlayers[0], this.livingPlayers[1], this.livingPlayers[2]],
        this.deadPlayers,
        [
          this.currentRoundActivity[0],
          this.currentRoundActivity[1],
          this.currentRoundActivity[2],
        ],
      );

      if (mexicanStandoffUpdates) {
        this.livingPlayers = mexicanStandoffUpdates.updatedLivingPlayers;
        this.deadPlayers = mexicanStandoffUpdates.updatedDeadPlayers;
        this.addRoundResult(mexicanStandoffUpdates.deaths);
        this.updateGameResults();
        return [true, 'Mexican standoff successfully finished'];
      }
      return [false, 'Unable to process Mexican Standoff round'];
    }

    // Standard Round
    const standardRoundUpdates = updatePlayers(
      this.livingPlayers,
      this.deadPlayers,
      this.currentRoundActivity,
    );
    if (standardRoundUpdates) {
      this.livingPlayers = standardRoundUpdates.updatedLivingPlayers;
      this.deadPlayers = standardRoundUpdates.updatedDeadPlayers;
      this.addRoundResult(standardRoundUpdates.deaths);
      this.updateGameResults();
      return [true, 'Standard round successfully processed'];
    }
    return [false, 'Error processing standard round'];
  }

  actionPreCheck(player: Player, targets?: Player[], ally?: Player) {
    if (!this.gameInitiated) return [false, 'No game in progress'];

    if (this.gameComplete) return [false, 'Game is complete'];

    if (this.currentPhase !== GamePhase.ActionSubmit) {
      return [
        false,
        `Can only submit during Action Submit Phase. Current Game Phase: ${this.currentPhase}`,
      ];
    }

    // Check if player is currently alive
    if (
      !this.livingPlayers.find((livingPlayer) => livingPlayer.id === player.id)
    )
      return [false, `${player.name} is not a valid living player`];

    // Check if player already submitted an action
    const index = this.currentRoundActivity.findIndex(
      (activity) => activity.player.id === player.id,
    );

    if (index !== -1)
      return [false, `${player.name} has already submitted an action`];

    // Check if all targets are valid living players
    let success = true;
    let msg = 'Action successfully pre-checked';
    if (targets) {
      targets.forEach((target) => {
        if (
          !this.livingPlayers.find(
            (livingPlayer) => livingPlayer.id === targets[0].id,
          )
        ) {
          success = false;
          msg = `${target.name} is not alive`;
          return;
        }
        // Check if target is the same as player
        if (
          targets[0].id === player.id ||
          (targets.length === 2 && targets[1].id === player.id)
        ) {
          success = false;
          msg = 'Player may not target themselves';
        }
      });
    }

    if (ally?.id === player.id) {
      success = false;
      msg = 'Player may not ally themselves';
      return [success, msg];
    }

    if (
      ally &&
      !this.livingPlayers.find((livingPlayer) => livingPlayer.id === ally.id)
    ) {
      success = false;
      msg = `Submitted ally ${ally?.name} is not alive`;
      return [success, msg];
    }

    return [success, msg];
  }

  /**
   * newRound
   */
  public newRound() {
    if (!this.gameInitiated) return;
    if (this.gameComplete) return;
    if (this.currentPhase !== GamePhase.ActionResolve) return;

    this.roundActivity.push(this.currentRoundActivity);
    this.clearRoundActivity();
    this.livingPlayers.forEach((livingPlayer) => livingPlayer.resetRoundDMG());
    this.currentPhase = GamePhase.Discussion;
  }

  private clearRoundActivity() {
    this.currentRoundActivity = [];
  }
}
