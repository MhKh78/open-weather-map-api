const baseSchemas = {
  // Base for any single object success
  baseSingleSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Request successful" },
      statusCode: { type: "integer", example: 200 },
    },
    required: ["success", "message", "statusCode"],
  },

  // Base for any list/paginated response
  baseListSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "List fetched" },
      meta: {
        type: "object",
        properties: {
          total: { type: "integer", example: 100 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 10 },
        },
      },
      statusCode: { type: "integer", example: 200 },
    },
    required: ["success", "message", "meta", "statusCode"],
  },
};

export const schemas = {
  ...baseSchemas,
  createWeather: {
    type: "object",
    required: ["cityName", "country", "lat", "lon", "fetchedAt"],
    properties: {
      cityName: { type: "string" },
      country: { type: "string" },
    },
  },
  weatherResponse: {
    allOf: [
      { $ref: "#/components/schemas/createWeather" },
      {
        type: "object",
        properties: {
          id: { type: "string" },
          lat: { type: "number" },
          lon: { type: "number" },
          temperature: { type: "number" },
          description: { type: "string" },
          humidity: { type: "integer" },
          windSpeed: { type: "number" },
          fetchedAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    ],
  },
  // ✅ Composed: weather response + single base
  singleWeatherSuccess: {
    allOf: [
      { $ref: "#/components/schemas/baseSingleSuccess" },
      {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/weatherResponse" },
        },
        required: ["data"],
      },
    ],
  },

  // ✅ Composed: list of weather + list base
  listWeatherSuccess: {
    allOf: [
      { $ref: "#/components/schemas/baseListSuccess" },
      {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/weatherResponse" },
          },
        },
        required: ["data"],
      },
    ],
  },
};
