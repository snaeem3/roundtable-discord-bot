import { Player } from '../game/Player';

export interface Choice {
  name: string;
  value: any;
}

export interface Option {
  name: string;
  description: string;
  required?: boolean;
  choices?: Choice[];
}

export interface Command {
  name: string;
  description: string;
  options?: Option[];
  deleted?: boolean;
  devOnly?: boolean;
  testOnly?: boolean;
  permissionRequired?: any[];
  botPermissions?: any[];
  //   callback?: () => void;
}

export interface Activity {
  player: Player;
  action: Action;
  ally?: Player;
  targets?: [Player] | [Player, Player];
}

export interface GhostActivity extends Activity {
  ghostTarget: Player;
}

export interface ActivityChecked extends Activity {
  finalAction: Action | 'none'; // could be set to Backstab or Penultimate Parry
  successfulAlly?: boolean;
}

export interface DMG {
  amount: number;
  originator: Player;
  type: Action.Slash | Action.ThrowingKnives;
}

export enum Action {
  ThrowingKnives = 'throwing knives',
  Backstab = 'backstab',
  PenultimateParry = 'penultimate parry',
  Deathwish = 'deathwish',
  Parry = 'parry',
  Slash = 'slash',
  Truce = 'truce',
  Renounce = 'renounce',
}

export enum GamePhase {
  None = 'none',
  Setup = 'setup', // when players can join the game
  Discussion = 'discussion',
  ActionSubmit = 'actionSubmit',
  ActionResolve = 'actionResolve',
}

export type Kill = {
  player: Player;
  method: Action;
};

export type RoundDeaths = {
  throwingKnives: Player[];
  backstab: Player[];
  penParry: Player[];
  unsuccessfulPenParry: Player[];
  successfulDeathwish: Player[];
  unsuccessfulDeathwish: Player[];
  parry: Player[];
  slash: Player[];
};

export type MexicanStandoffRoundDeaths = Pick<
  RoundDeaths,
  'slash' | 'parry' | 'successfulDeathwish' | 'unsuccessfulDeathwish'
>;
