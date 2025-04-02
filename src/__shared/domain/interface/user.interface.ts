import { UserRoleEnum } from "../enum";

export interface IUser {
  id: string;
  role: UserRoleEnum;
  email: string;
}
