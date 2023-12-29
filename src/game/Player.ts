export class Player {
  id: string;

  name: string;

  dmg: number;

  def: number;

  ghost: boolean;

  uniqueAlliances: Player[];

  assistedKills: Player[];

  soloKills: Player[];

  victoryPoints: number;

  constructor(playerId: string, playerName: string) {
    this.id = playerId;
    this.name = playerName;
    this.dmg = 1;
    this.def = 2;
    this.ghost = false;
    this.uniqueAlliances = [];
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
      uniqueAlliances: this.uniqueAlliances,
      assistedKills: this.assistedKills,
      soloKills: this.soloKills,
      victoryPoints: this.victoryPoints,
    };
  }

  public get tieBreakerScore() {
    return (
      this.assistedKills.length +
      this.soloKills.length +
      this.uniqueAlliances.length
    );
  }

  public addUniqueAlly(ally: Player) {
    // check that the given ally is not already included
    if (this.uniqueAlliances.find((uniqueAlly) => uniqueAlly.id === ally.id))
      return;
    this.uniqueAlliances.push(ally);
  }

  public resetDEF(def: number = 2) {
    this.def = def;
  }
}
