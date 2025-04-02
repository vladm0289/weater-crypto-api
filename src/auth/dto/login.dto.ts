import { IsEmail, IsNotEmpty, Length, MaxLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(128)
  email: string;

  @IsNotEmpty()
  @Length(6, 128)
  password: string;
}
