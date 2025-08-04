import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { ResponseBuilder } from "@utils/response-builder";

export class AuthController {
  private service = new AuthService();

  // Routes
  register = async (req: Request<{}, {}, RegisterUserDto>, res: Response) => {
    const { username, password } = req.body;
    await this.service.register(username, password);
    res.status(201).json(ResponseBuilder.created("User registered"));
  };

  login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const token = await this.service.login(username, password);
    res.json(ResponseBuilder.success("Login successful", { token }));
  };
}
