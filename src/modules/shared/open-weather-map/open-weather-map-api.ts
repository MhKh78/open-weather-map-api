import axios from "axios";
import { ForecastApiResult, WeatherApiResult } from "./types";
import { ApiError } from "@utils/api-error";

export class OpenWeatherMapService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.openweathermap.org/";
  private readonly weatherPath = "data/2.5/weather";
  private readonly forecastPath = "data/2.5/forecast";
  private readonly geoPath = "geo/1.0/direct";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) {
      throw new Error("OpenWeatherMap API key is missing");
    }
  }

  async fetchCity(
    city: string,
    country: string
  ): Promise<{
    cityName: string;
    country: string;
    lat: number;
    lon: number;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}${this.geoPath}`, {
        params: {
          q: country ? `${city},${country}` : city,
          limit: 1,
          appid: this.apiKey,
        },
      });

      const [geo] = response.data;
      console.log(response, "response");

      if (!geo) {
        throw new ApiError(
          `Geo lookup failed to find a City ${city} ${
            country ? `in Country ${country}` : ""
          }`,
          404
        );
      }

      return {
        cityName: geo.name,
        country: geo.country,
        lat: geo.lat,
        lon: geo.lon,
      };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      const message =
        error.response?.data?.message || "Geocoding API fetch failed";
      throw new ApiError(
        `OpenWeatherMapGeo error: ${message}`,
        error.response?.statusCode || 500
      );
    }
  }

  async fetchWeather(
    city: string,
    country?: string
  ): Promise<WeatherApiResult> {
    try {
      const response = await axios.get(`${this.baseUrl}${this.weatherPath}`, {
        params: {
          q: country ? `${city},${country}` : `${city}`,
          units: "metric",
          appid: this.apiKey,
        },
      });

      const data = response.data;

      return {
        country: data?.sys?.country || country,
        cityName: data.name || city,
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
      throw new ApiError(
        `OpenWeatherMapApi error: ${message}`,
        error.response?.status || 500
      );
    }
  }

  async fetchForecast(
    city: string,
    country?: string
  ): Promise<ForecastApiResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}${this.forecastPath}`, {
        params: {
          q: country ? `${city},${country}` : city,
          units: "metric",
          appid: this.apiKey,
        },
      });

      const list = response.data.list;

      // Group by day (based on forecast timestamp)
      const dayMap = new Map<string, ForecastApiResult>();

      for (const item of list) {
        const dateStr = item.dt_txt.split(" ")[0]; // 'YYYY-MM-DD'

        const current = dayMap.get(dateStr);
        const minTemp = item.main.temp_min;
        const maxTemp = item.main.temp_max;
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed;
        const description = item.weather?.[0]?.description ?? "unknown";

        if (!current) {
          dayMap.set(dateStr, {
            forecastDate: dateStr,
            temperatureMin: minTemp,
            temperatureMax: maxTemp,
            humidity,
            windSpeed,
            description,
          });
        } else {
          current.temperatureMin = Math.min(current.temperatureMin, minTemp);
          current.temperatureMax = Math.max(current.temperatureMax, maxTemp);
          current.humidity = Math.max(current.humidity, humidity);
          current.windSpeed = Math.max(current.windSpeed, windSpeed);
        }
      }

      // Return first 5 full days only
      return Array.from(dayMap.values()).slice(0, 5);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Forecast API fetch failed";
      throw new ApiError(
        `OpenWeatherMapApi error: ${message}`,
        error.response?.status || 500
      );
    }
  }
}
