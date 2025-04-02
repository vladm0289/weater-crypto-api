import { Router } from "express";
import { container } from "tsyringe";

import { UserController } from "./user.controller";
import {
  validateAuth,
  validateDto,
  validateParamsUuid,
  validateRole,
} from "@spinanda/__shared/domain/middleware";
import { UserRoleEnum } from "@spinanda/__shared/domain/enum";
import { UpdateUserDto } from "./dto";

const router = Router();
const controller = container.resolve(UserController);

router.get(
  "/",
  validateAuth(),
  validateRole([UserRoleEnum.ADMIN]),
  controller.getAllUsers
);
router.get(
  "/:id",
  validateAuth(),
  validateRole([UserRoleEnum.ADMIN]),
  validateParamsUuid(),
  controller.getUserById
);
router.patch(
  "/:id",
  validateAuth(),
  validateRole([UserRoleEnum.ADMIN]),
  validateParamsUuid(),
  validateDto(UpdateUserDto),
  controller.updateUser
);
router.delete(
  "/:id",
  validateAuth(),
  validateRole([UserRoleEnum.ADMIN]),
  validateParamsUuid(),
  controller.deleteUser
);

export default router;
