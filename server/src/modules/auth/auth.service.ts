import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'generated/prisma/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordCorrect = await bcrypt.compare(pass, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    firstName: string,
    middleName: string,
    lastName: string,
    role: Role,
    email: string,
    password: string,
    course?: string,
    yearLevel?: number,
    department?: string,
  ): Promise<void> {
    await this.usersService.createUser(
      firstName,
      middleName,
      lastName,
      role,
      email,
      password,
      course,
      yearLevel,
      department,
    );
  }
}
