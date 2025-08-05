import { IsOptional, IsNumber, IsString, IsDateString } from "class-validator";

export class UpdateWeatherDto {
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsOptional()
  @IsNumber()
  windSpeed?: number;
}
