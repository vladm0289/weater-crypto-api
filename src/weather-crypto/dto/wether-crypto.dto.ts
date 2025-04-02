import { transformToBoolean } from "@spinanda/__shared/domain/utils";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class WeatherCryptoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  city: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  currency: string;

  @IsOptional()
  @Transform(transformToBoolean)
  refresh?: boolean;
}
