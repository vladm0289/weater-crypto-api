import { Response, NextFunction } from "express";
import { IRequest } from "../interface";
import { UserRoleEnum } from "../enum";

export function validateRole(allowedRoles: UserRoleEnum[]) {
  return (req: IRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    next();
  };
}
