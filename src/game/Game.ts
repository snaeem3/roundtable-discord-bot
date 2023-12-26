import { Player } from './Player';

export class Game {
  gameInitiated: boolean;

  livingPlayers: Player[];

  deadPlayers: Player[];

  constructor() {
    this.gameInitiated = false;
    this.livingPlayers = [];
    this.deadPlayers = [];
  }

  public get gameStatus() {
    return {
      gameInitiated: this.gameInitiated,
      livingPlayers: this.livingPlayers,
      deadPlayers: this.deadPlayers,
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
}
