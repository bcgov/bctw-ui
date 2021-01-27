import { Type } from 'class-transformer';
import { BctwBaseType } from './common_types';

export enum UserRole {
  administrator,
  owner,
  observer
}

export interface IUser extends BctwBaseType {
  id: number;
  idir: string;
  bceid: string;
  email: string;
}

export class User implements IUser {
  role: UserRole;
  id: number;
  idir: string;
  bceid: string;
  email: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
}
