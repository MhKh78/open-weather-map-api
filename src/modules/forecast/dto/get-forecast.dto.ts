import { IsUUID } from "class-validator";

export class getForecastByIdDto {
  @IsUUID()
  id!: string;
}
