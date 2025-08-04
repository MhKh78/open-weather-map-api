import axios from "axios";
import { WeatherApiResult } from "./types";

export class OpenWeatherMapService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.openweathermap.org/data/2.5/weather";

  constructor(apiKey: string) {
    this.apiKey = apiKey || process.env.OPENWEATHERMAP_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OpenWeatherMap API key is missing");
    }
  }

  async fetchByCity(city: string, country: string): Promise<WeatherApiResult> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: `${city},${country}`,
          units: "metric",
          appid: this.apiKey,
        },
      });

      const data = response.data;

      return {
        lat: data.coord.lat,
        lon: data.coord.lon,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather?.[0]?.description ?? "unknown",
        windSpeed: data.wind.speed,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Weather API fetch failed";
      throw new Error(`OpenWeatherMap error: ${message}`);
    }
  }
}
