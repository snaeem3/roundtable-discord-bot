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
