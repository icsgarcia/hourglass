import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('classroom')
export class ClassroomsController {
  constructor(private classroomsService: ClassroomsService) {}

  @UseGuards(AuthGuard)
  @Post()
  createClassroom(@Body() ClassroomRequestDto: any, @Request() req) {
    if (req.user.role !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can create classrooms');
    }
    return this.classroomsService.createClassroom(
      ClassroomRequestDto.name,
      ClassroomRequestDto.course,
      ClassroomRequestDto.yearLevel,
      req.user.sub,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteClassroom(@Param('id') id: number) {
    return this.classroomsService.deleteClassroomById(id);
  }
}
