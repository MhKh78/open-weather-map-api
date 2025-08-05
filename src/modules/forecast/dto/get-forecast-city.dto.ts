import { IsString } from "class-validator";

export class getForecastByCityDto {
  @IsString()
  cityName!: string;
}
