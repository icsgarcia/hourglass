import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { userInfo } from 'os';

@Injectable()
export class ClassroomsService {
  constructor(private prismaService: PrismaService) {}

  async getAllClassroom() {
    const classrooms = await this.prismaService.classroom.findMany();
    return classrooms;
  }

  async getClassroomById(id: string) {
    const classroom = await this.prismaService.classroom.findUnique({
      where: {
        id,
      },
      include: {
        owner: {
          include: {
            user: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        teachers: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        students: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  async getClassroomByUser(userId: string, userRole: Role) {
    if (userRole === 'TEACHER') {
      return await this.prismaService.classroom.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              teachers: {
                some: {
                  teacherId: userId,
                },
              },
            },
          ],
        },
        include: {
          owner: {
            include: {
              user: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (userRole === 'STUDENT') {
      return await this.prismaService.classroom.findMany({
        where: {
          students: {
            some: {
              studentId: userId,
            },
          },
        },
        include: {
          owner: {
            include: {
              user: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return [];
  }

  async createClassroom(
    name: string,
    course: string,
    yearLevel: number,
    ownerId: string,
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

  async getInvitations(userId: any) {
    const invitations = await this.prismaService.classroomInvitation.findMany({
      where: {
        invitedUserId: userId,
        status: 'PENDING',
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            course: true,
            yearLevel: true,
            owner: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    middleName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return invitations;
  }

  async createClassroomInvite(
    classroomId: string,
    email: string,
    role: Role,
    sub: string,
  ) {
    const classroom = await this.prismaService.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    if (classroom.ownerId !== sub) {
      throw new ForbiddenException('Only classroom owner can send invitations');
    }

    const invitedUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!invitedUser) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const existingInvitation =
      await this.prismaService.classroomInvitation.findFirst({
        where: {
          classroomId,
          invitedUserId: invitedUser.id,
          status: 'PENDING',
        },
      });

    if (existingInvitation) {
      throw new ConflictException('Invitation already sent to this user');
    }

    const invitation = await this.prismaService.classroomInvitation.create({
      data: {
        classroomId,
        invitedById: sub,
        invitedUserId: invitedUser.id,
        role,
      },
    });

    return { message: 'Invitation sent successfully', invitation };
  }

  async deleteClassroomById(id: string) {
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

  async acceptClassroomInvite(invitationId: string, userId: string) {
    const invitation = await this.prismaService.classroomInvitation.findUnique({
      where: { id: invitationId },
      include: {
        invitedUser: {
          include: {
            student: true,
            teacher: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedUserId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to accept this invitation',
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new ConflictException('Invitation has already been responded to');
    }

    if (invitation.role === 'STUDENT' && !invitation.invitedUser.student) {
      throw new ForbiddenException('User is not a student');
    }

    if (invitation.role === 'TEACHER' && !invitation.invitedUser.teacher) {
      throw new ForbiddenException('User is not a teacher');
    }

    await this.prismaService.$transaction(async (tx) => {
      if (invitation.role === 'STUDENT') {
        const existingStudent = await tx.classroomStudent.findUnique({
          where: {
            classroomId_studentId: {
              classroomId: invitation.classroomId,
              studentId: userId,
            },
          },
        });

        if (!existingStudent) {
          await tx.classroomStudent.create({
            data: {
              classroomId: invitation.classroomId,
              studentId: userId,
            },
          });
        }
      }

      if (invitation.role === 'TEACHER') {
        const existingTeacher = await tx.classroomTeacher.findUnique({
          where: {
            classroomId_teacherId: {
              classroomId: invitation.classroomId,
              teacherId: userId,
            },
          },
        });

        if (!existingTeacher) {
          await tx.classroomTeacher.create({
            data: {
              classroomId: invitation.classroomId,
              teacherId: userId,
            },
          });
        }
      }

      await tx.classroomInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
    });

    return { message: 'Invitation accepted successfully' };
  }

  async rejectClassroomInvite(invitationId: string, userId: string) {
    const invitation = await this.prismaService.classroomInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedUserId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to reject this invitation.',
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new ConflictException('Invitation has already been responded to');
    }

    await this.prismaService.classroomInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });

    return { message: 'Invitation rejected successfully' };
  }
}
