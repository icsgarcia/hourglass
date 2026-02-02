import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('attendances')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @UseGuards(AuthGuard)
  @Get(':classroomId/attendances')
  getAttendance(@Param('classroomId') classroomId: string, @Request() req) {
    return this.attendanceService.getAttendances(classroomId, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get(':classroomId/attendance')
  getAttendanceToday(
    @Param('classroomId') classroomId: string,
    @Request() req,
  ) {
    return this.attendanceService.getAttendanceToday(classroomId, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(':classroomId/time-in')
  timeIn(
    @Param('classroomId') classroomId: string,
    @Request() req,
    @Body() body: { date: string },
  ) {
    return this.attendanceService.timeIn(
      classroomId,
      req.user.sub,
      new Date(body.date),
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':classroomId/time-out')
  timeOut(
    @Param('classroomId') classroomId: string,
    @Request() req,
    @Body() body: { date: string },
  ) {
    return this.attendanceService.timeOut(
      classroomId,
      req.user.sub,
      new Date(body.date),
    );
  }
}
