import { Request, Response, NextFunction } from "express";
import { validate } from "uuid";

export function validateParamsUuid() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    if (!validate(userId)) {
      res.status(400).json({ message: "Invalid UUID format for user ID" });
      return;
    }
    next();
  };
}
