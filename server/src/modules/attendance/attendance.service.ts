import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prismaService: PrismaService) {}

  async getAttendances(classroomId: string, userId: string) {
    const student = await this.prismaService.student.findUnique({
      where: {
        id: userId,
      },
    });

    if (!student) {
      throw new ForbiddenException('User is not a student');
    }

    const studentInClass = await this.prismaService.classroomStudent.findUnique(
      {
        where: {
          classroomId_studentId: {
            classroomId,
            studentId: student.id,
          },
        },
      },
    );

    if (!studentInClass) {
      throw new ForbiddenException('Student is not in this classroom');
    }

    const attendances = await this.prismaService.attendanceLog.findMany({
      where: {
        classroomId,
        studentId: student.id,
      },
    });

    return attendances;
  }

  async getAttendanceToday(classroomId: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const student = await this.prismaService.student.findUnique({
      where: {
        id: userId,
      },
    });

    if (!student) {
      throw new ForbiddenException('User is not a student');
    }

    const studentInClass = await this.prismaService.classroomStudent.findUnique(
      {
        where: {
          classroomId_studentId: {
            classroomId,
            studentId: student.id,
          },
        },
      },
    );

    if (!studentInClass) {
      throw new ForbiddenException('Student is not in this classroom');
    }

    const attendance = await this.prismaService.attendanceLog.findUnique({
      where: {
        classroomId_studentId_date: {
          classroomId,
          studentId: student.id,
          date: today,
        },
      },
    });

    return attendance;
  }

  async timeIn(classroomId: string, userId: string, date: Date) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

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
            date: dateOnly,
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
        date: dateOnly,
        timeIn: date,
      },
    });
  }

  async timeOut(classroomId: string, userId: string, date: Date) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const timeOut = new Date(date);

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
            date: dateOnly,
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
