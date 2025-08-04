import { config } from "@root/config";
import * as swaggerJSDoc from "swagger-jsdoc";
import { schemas } from "./swagger-schemas";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Weather API",
      version: "1.0.0",
      description: "API documentation for the Weather app",
    },
    servers: [
      {
        url: `http://${config.host}:${config.port}`, // Adjust if needed
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [config.rootDir + "/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
