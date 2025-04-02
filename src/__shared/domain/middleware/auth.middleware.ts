import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";

import { IRequest, IUser } from "../interface";

export function validateAuth() {
  return async (req: IRequest, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Authorization token is required" });
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
      }
      req.user = payload as IUser;
      next();
    });
  };
}
