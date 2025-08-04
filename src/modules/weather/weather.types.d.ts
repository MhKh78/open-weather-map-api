export interface WeatherInput {
  city_name: string;
  country: string;
}

export interface WeatherResponse extends WeatherInput {
  id: string;
  created_at: Date;
}
