import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassroomsService {
  constructor(private prismaService: PrismaService) {}

  async getAllClassroom() {
    const classrooms = await this.prismaService.classroom.findMany();
    return classrooms;
  }

  async getClassroomById(id: number) {
    const classroom = await this.prismaService.classroom.findUnique({
      where: {
        id,
      },
    });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  async createClassroom(
    name: string,
    course: string,
    yearLevel: number,
    ownerId: number,
  ) {
    await this.prismaService.classroom.create({
      data: {
        name,
        course,
        yearLevel,
        ownerId,
      },
    });
  }

  async deleteClassroomById(id: number) {
    const classroom = await this.prismaService.classroom.findUnique({
      where: {
        id,
      },
    });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    await this.prismaService.classroom.delete({
      where: {
        id,
      },
    });

    return { message: 'Classroom deleted successfully' };
  }
}
