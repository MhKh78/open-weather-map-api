// src/utils/jwt.ts
import { config } from "@root/config";
import * as jwt from "jsonwebtoken";

export const generateJwt = (payload: object) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });

export const verifyJwt = (token: string) => jwt.verify(token, config.jwtSecret);
