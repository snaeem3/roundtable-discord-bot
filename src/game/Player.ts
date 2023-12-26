export class Player {
  name: string;

  dmg: number;

  def: number;

  ghost: boolean;

  alliances: string[];

  assistedKills: string[];

  soloKills: string[];

  victoryPoints: number;

  //   ally: ;

  constructor(playerName: string) {
    this.name = playerName;
    this.dmg = 1;
    this.def = 2;
    this.ghost = false;
    this.alliances = [];
    this.assistedKills = [];
    this.soloKills = [];
    this.victoryPoints = 0;
  }
}
