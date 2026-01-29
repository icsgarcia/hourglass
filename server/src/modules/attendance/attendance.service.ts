import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prismaService: PrismaService) {}

  async timeIn(classroomId: string, userId: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const student = await this.prismaService.student.findUnique({
      where: userId,
    });

    if (!student) {
      throw new ForbiddenException();
    }

    const existingAttendanceLog =
      await this.prismaService.attendanceLog.findUnique({
        where: {
          classroomId_studentId_date: {
            classroomId,
            studentId: student.id,
            date: today,
          },
        },
      });

    if (existingAttendanceLog) {
      throw new BadRequestException('Already timed in today');
    }

    return this.prismaService.attendanceLog.create({
      data: {
        classroomId,
        studentId: student.id,
        date: today,
        timeIn: new Date(),
      },
    });
  }

  async timeOut(classroomId: string, userId: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeOut = new Date();

    const student = await this.prismaService.student.findUnique({
      where: {
        id: userId,
      },
    });

    if (!student) {
      throw new ForbiddenException();
    }

    const existingAttendanceLog =
      await this.prismaService.attendanceLog.findUnique({
        where: {
          classroomId_studentId_date: {
            classroomId,
            studentId: student.id,
            date: today,
          },
        },
      });

    if (!existingAttendanceLog || existingAttendanceLog.timeOut) {
      throw new BadRequestException('No active time-in');
    }

    const totalMinutes = Math.floor(
      (timeOut.getTime() - existingAttendanceLog.timeIn.getTime()) / 60000,
    );

    return this.prismaService.attendanceLog.update({
      where: {
        id: existingAttendanceLog.id,
      },
      data: {
        timeOut,
        totalMinutes,
      },
    });
  }
}
