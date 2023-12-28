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
  targets?: Player[];
}

export interface GhostActivity extends Activity {
  ghostTarget: Player;
}

export interface ActivityChecked extends Activity {
  finalAction: Action;
  successfulAlly?: boolean;
}

export enum Action {
  Slash = 'slash',
  Parry = 'parry',
  Deathwish = 'deathwish',
  Backstab = 'backstab',
  PenultimateParry = 'penultimate parry',
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
