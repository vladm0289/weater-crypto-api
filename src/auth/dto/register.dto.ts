import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

import { UserRoleEnum } from "@spinanda/__shared/domain/enum";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(128)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 128)
  password: string;

  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;
}
