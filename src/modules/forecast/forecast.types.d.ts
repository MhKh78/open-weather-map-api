import { User } from "@db/entities/user.entity";

export interface WeatherInput {
  cityName: string;
  country: string;
}
export interface WeatherCreationInput extends WeatherInput {
  createdBy: Partial<User>;
}

export interface WeatherResponse extends WeatherCreationInput {
  id: string;
  created_at: Date;
}
