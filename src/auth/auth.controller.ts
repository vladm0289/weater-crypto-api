import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { handlePrismaError } from "@spinanda/__shared/infrastructure/utils";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import { LoginDto, RegisterDto } from "./dto";
import { IRequest } from "@spinanda/__shared/domain/interface";
import { AuthService } from "./auth.service";

@injectable()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger
  ) {}

  register = async (req: Request, res: Response) => {
    try {
      const dto: RegisterDto = req.body;
      const result = await this.authService.register(dto);
      res.status(201).json(result);
    } catch (error: any) {
      this.logger.error(`Error during registration request, ${error.message}`);
      res.status(400).json({ message: handlePrismaError(error) });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const dto: LoginDto = req.body;
      const result = await this.authService.login(dto);
      res.status(200).json(result);
    } catch (error: any) {
      this.logger.error(`Error during login request, ${error.message}`);
      res.status(400).json({ message: handlePrismaError(error) });
    }
  };

  profile = async (req: IRequest, res: Response) => {
    try {
      const user = await this.authService.getUserProfile(req.user.id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      this.logger.error(`Error during profile request, ${error.message}`);
      res.status(400).json({ message: handlePrismaError(error) });
    }
  };
}
