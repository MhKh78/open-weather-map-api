// src/modules/weather/dto/weather-id-param.dto.ts
import { IsString, IsUUID } from "class-validator";

export class getWeatherByCityDto {
  @IsString()
  cityName!: string;
}
