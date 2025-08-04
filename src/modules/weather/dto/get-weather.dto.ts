// src/modules/weather/dto/weather-id-param.dto.ts
import { IsUUID } from "class-validator";

export class getWeatherByIdDto {
  @IsUUID()
  id!: string;
}
