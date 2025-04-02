import "reflect-metadata";
import { Response, Request } from "express";
import { injectable } from "tsyringe";

import { UserService } from "./user.service";
import { handlePrismaError } from "@spinanda/__shared/infrastructure/utils";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import { IRequest } from "@spinanda/__shared/domain/interface";

@injectable()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger
  ) {}

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      this.logger.error(`Error during get user list request, ${error.message}`);
      res.status(400).json({ message: handlePrismaError(error) });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;

      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      this.logger.error(`Error during get user request, ${error.message}`);
      res.status(400).json({ message: handlePrismaError(error) });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const updatedUser = await this.userService.updateUser(
        req.params.id,
        req.body
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      this.logger.error(`Error during get user request, ${error.message}`);
      res.status(400).json({ message: handlePrismaError(error) });
    }
  };

  deleteUser = async (req: IRequest, res: Response) => {
    try {
      const userId = req.params.id;

      await this.userService.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      this.logger.error(`Error during get user request, ${error.message}`);
      res.status(400).json({ message: handlePrismaError(error) });
    }
  };
}
