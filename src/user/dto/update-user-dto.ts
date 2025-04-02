import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

import { UserRoleEnum } from "@spinanda/__shared/domain/enum";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  email: string;

  @IsOptional()
  @IsString()
  @Length(6, 128)
  password: string;

  @IsOptional()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
