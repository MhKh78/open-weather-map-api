// src/dto/CreateWeatherDto.ts
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsDate,
  Min,
  Max,
} from "class-validator";

export class CreateWeatherDto {
  @IsNotEmpty()
  @IsString()
  cityName!: string;

  @IsNotEmpty()
  @IsString()
  country!: string;
}
