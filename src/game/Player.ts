export class Player {
  id: string;

  name: string;

  dmg: number;

  def: number;

  ghost: boolean;

  alliances: string[];

  assistedKills: string[];

  soloKills: string[];

  victoryPoints: number;

  //   ally: ;

  constructor(playerId: string, playerName: string) {
    this.id = playerId;
    this.name = playerName;
    this.dmg = 1;
    this.def = 2;
    this.ghost = false;
    this.alliances = [];
    this.assistedKills = [];
    this.soloKills = [];
    this.victoryPoints = 0;
  }

  public get playerStatus() {
    return {
      id: this.id,
      name: this.name,
      dmg: this.dmg,
      def: this.def,
      ghost: this.ghost,
      alliances: this.alliances,
      assistedKills: this.assistedKills,
      soloKills: this.soloKills,
      victoryPoints: this.victoryPoints,
    };
  }
}
