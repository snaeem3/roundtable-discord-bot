import { Player } from './Player';

export class Game {
  gameInitiated: boolean;

  livingPlayers: Player[];

  deadPlayers: Player[];

  discussionPhaseInProgress: boolean;

  constructor() {
    this.gameInitiated = false;
    this.livingPlayers = [];
    this.deadPlayers = [];
    this.discussionPhaseInProgress = false;
  }

  public get gameStatus() {
    return {
      gameInitiated: this.gameInitiated,
      livingPlayers: this.livingPlayers,
      deadPlayers: this.deadPlayers,
      discussionPhaseInProgress: this.discussionPhaseInProgress,
    };
  }

  public initiateGame() {
    this.gameInitiated = true;
    return [true, 'Game Initiated'];
  }

  public resetGame() {
    this.gameInitiated = false;
    this.livingPlayers = [];
    this.deadPlayers = [];
    return [true, 'Game Reset'];
  }

  public joinGame(player: Player) {
    console.log('player attempting to join game: ', player.playerStatus);
    // if game hasn't been initiated
    if (!this.gameInitiated) return [false, 'Game not initiated'];

    // if game already started
    // return [false, 'Game has already started']

    // if player hasn't already joined
    if (this.livingPlayers.includes(player))
      return [false, `${player.name} has already joined`];

    this.livingPlayers.push(player);

    return [true, `${player.name} has successfully joined the game`];
  }

  public toggleDiscussionPhaseInProgress() {
    this.discussionPhaseInProgress = !this.discussionPhaseInProgress;
  }

  public beginDiscussionPhase(time?: number) {
    if (!this.gameInitiated) return [false, 'No game in progress'];

    if (this.discussionPhaseInProgress)
      return [false, 'Discussion phase already in progress'];

    if (this.livingPlayers.length < 2)
      return [
        false,
        `Not enough players to begin. Current player count: ${this.livingPlayers.length}`,
      ];

    return [true, 'Round can begin'];
  }
}
