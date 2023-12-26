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

  public initiateGame() {
    this.gameInitiated = true;
    return [true, 'Game Initiated'];
  }

  public get gameStatus() {
    return {
      gameInitiated: this.gameInitiated,
      livingPlayers: this.livingPlayers,
      deadPlayers: this.deadPlayers,
    };
  }

  public resetGame() {
    this.gameInitiated = false;
    this.livingPlayers = [];
    this.deadPlayers = [];
    return [true, 'Game Reset'];
  }

  public joinGame(player: Player) {
    // if game hasn't started

    // if player hasn't already joined

    this.livingPlayers.push(player);
  }
}
