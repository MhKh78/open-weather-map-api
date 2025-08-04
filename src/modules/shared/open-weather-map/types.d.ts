export interface WeatherApiResult {
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  fetchedAt: string;
}
