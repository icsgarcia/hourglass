import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findAllUsers() {
    return this.prismaService.user.findMany();
  }

  async findUserById(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async createUser(
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
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    if (role === 'STUDENT' && (!course || !yearLevel)) {
      throw new BadRequestException(
        'Course and year level are required for students',
      );
    }
    if (role === 'TEACHER' && !department) {
      throw new BadRequestException('Department is required for teachers');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const user = await this.prismaService.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        role,
        email,
        password: hashedPassword,
      },
    });
    if (role === 'STUDENT') {
      await this.prismaService.student.create({
        data: {
          id: user.id,
          course: course!,
          yearLevel: yearLevel!,
        },
      });
    } else if (role === 'TEACHER') {
      await this.prismaService.teacher.create({
        data: {
          id: user.id,
          department: department!,
        },
      });
    }
  }
}
