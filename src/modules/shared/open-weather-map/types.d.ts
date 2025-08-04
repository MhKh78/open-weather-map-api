export interface WeatherApiResult {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  fetchedAt: string;
}
