// src/modules/weather/dto/weather-id-param.dto.ts
import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsUUID, Max } from "class-validator";

export class GetForecastListDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(50)
  limit: number = 50;
}
