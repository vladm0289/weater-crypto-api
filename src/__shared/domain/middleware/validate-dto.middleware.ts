import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const payload = plainToInstance(dtoClass, { ...req.body, ...req.query });
    const errors = await validate(payload, {
      whitelist: true,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap((err) =>
        Object.values(err.constraints || {})
      );
      res.status(400).json({ message: messages.join(", ") });
      return;
    }

    req.body = payload;
    next();
  };
}
