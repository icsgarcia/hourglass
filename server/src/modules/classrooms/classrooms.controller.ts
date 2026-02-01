import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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

  // Classroom
  @UseGuards(AuthGuard)
  @Get()
  getClassroomsByUser(@Request() req) {
    return this.classroomsService.getClassroomByUser(
      req.user.sub,
      req.user.role,
    );
  }

  @UseGuards(AuthGuard)
  @Get('invites')
  getInvitations(@Request() req) {
    return this.classroomsService.getInvitations(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get(`:classroomId`)
  getClassroomsById(@Param('classroomId') classroomId: string) {
    return this.classroomsService.getClassroomById(classroomId);
  }

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
  deleteClassroom(@Param('id') id: string) {
    return this.classroomsService.deleteClassroomById(id);
  }

  // add that role === teacher can only do this
  @UseGuards(AuthGuard)
  @Post(':classroomId/invite')
  createClassroomInvite(
    @Param('classroomId') classroomId: string,
    @Body() classroomInviteDto,
    @Request() req,
  ) {
    return this.classroomsService.createClassroomInvite(
      classroomId,
      classroomInviteDto.email,
      classroomInviteDto.role,
      req.user.sub,
    );
  }

  @UseGuards(AuthGuard)
  @Post('invitations/:invitationId/accept')
  acceptClassroomInvite(
    @Param('invitationId') invitationId: string,
    @Request() req,
  ) {
    return this.classroomsService.acceptClassroomInvite(
      invitationId,
      req.user.sub,
    );
  }

  @UseGuards(AuthGuard)
  @Post('invitations/:invitationId/reject')
  rejectClassroomInvite(
    @Param('invitationId') invitationId: string,
    @Request() req,
  ) {
    return this.classroomsService.rejectClassroomInvite(
      invitationId,
      req.user.sub,
    );
  }
}
