import "reflect-metadata";
import { Router } from "express";
import { container } from "tsyringe";

import {
  validateAuth,
  validateDto,
} from "@spinanda/__shared/domain/middleware";
import { LoginDto, RegisterDto } from "./dto";
import { AuthController } from "./auth.controller";

const router = Router();

const controller = container.resolve(AuthController);

router.post("/register", validateDto(RegisterDto), controller.register);
router.post("/login", validateDto(LoginDto), controller.login);

router.get("/profile", validateAuth(), controller.profile);

export default router;
