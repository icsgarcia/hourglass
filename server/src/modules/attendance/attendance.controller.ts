import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @UseGuards(AuthGuard)
  @Post(':classroomId/time-in')
  timeIn(@Param('classroomId') classroomId: string, @Request() req) {
    return this.attendanceService.timeIn(classroomId, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(':classroomId/time-out')
  timeOut(@Param('classroomId') classroomId: string, @Request() req) {
    return this.attendanceService.timeOut(classroomId, req.user.sub);
  }
}
