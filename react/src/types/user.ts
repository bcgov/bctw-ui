import { BctwBaseType } from "./common_types";

enum eUserRole { Administrator }

export interface IUser extends BctwBaseType {
  id: number;
  idir: string;
  bceid: string;
  email: string;
}

export {
  eUserRole,
} 

