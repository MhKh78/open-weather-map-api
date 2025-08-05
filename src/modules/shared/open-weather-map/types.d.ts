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

export interface ForecastApiResult {
  forecastDate: string;
  temperatureMin: number;
  temperatureMax: number;
  description: string;
  humidity: number;
  windSpeed: number;
}
