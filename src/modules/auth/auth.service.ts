// src/modules/auth/auth.service.ts
import * as bcrypt from "bcrypt";
import AppDataSource from "@db/data-source";
import { User } from "@db/entities/user.entity";
import { generateJwt } from "@utils/jwt";
import { ApiError } from "@utils/api-error";
import { UserRepository } from "@db/repositories/user.repository";

export class AuthService {
  private userRepo = UserRepository(AppDataSource);

  async register(username: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) throw new ApiError("User exists", 400);

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ username, password: hashed });
    await this.userRepo.save(user);
  }

  async login(username: string, password: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { username },
      // We Must Explicitly Say We Want The Password
      select: ["id", "username", "password"],
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ApiError("Invalid credentials", 409);
    }

    return generateJwt({ id: user.id, email: user.username });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }
}
