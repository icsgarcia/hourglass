import Layout from "@/layouts/Layout";
import { api } from "@/services/axios";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { Classroom } from "./Classrooms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import InviteDialog from "@/components/InviteDialog";
import { useAuth } from "@/contexts/AuthContext";
import CalendarComponent from "@/components/CalendarComponent";
import AttendanceDialog from "@/components/AttendanceDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ClassroomDetails extends Classroom {
    teachers: Array<{
        teacher: {
            user: {
                id: string;
                firstName: string;
                middleName: string;
                lastName: string;
                email: string;
            };
        };
    }>;
    students: Array<{
        student: {
            user: {
                id: string;
                firstName: string;
                middleName: string;
                lastName: string;
                email: string;
            };
        };
    }>;
}

export interface InviteData {
    email: string;
    role: string;
}

export interface Attendance {
    id: string;
    classroomId: string;
    studentId: string;
    createdAt: Date;
    date: Date;
    timeIn: Date;
    timeOut: Date | null;
    totalMinutes: number | null;
}

const queryClient = new QueryClient();

const Classroom = () => {
    const params = useParams();
    const { user } = useAuth();
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<Date | undefined>(undefined);
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
    const [inviteData, setInviteData] = useState<InviteData>({
        email: "",
        role: "",
    });

    useEffect(() => {
        if (!openInviteDialog) {
            setInviteData({
                email: "",
                role: "",
            });
        }
    }, [openInviteDialog]);

    useEffect(() => {
        if (!openAttendanceDialog) {
            setDate(undefined);
            setTime(undefined);
        } else {
            setTime(new Date());
        }
    }, [openAttendanceDialog]);

    const { data: classroom } = useQuery({
        queryKey: ["classroom", params.classroomId],
        queryFn: async (): Promise<ClassroomDetails> => {
            const response = await api.get(`/classroom/${params.classroomId}`);
            return response.data;
        },
        enabled: !!params.classroomId,
    });

    const invite = useMutation({
        mutationFn: async (inviteData: InviteData) => {
            const response = await api.post(
                `/classroom/${params.classroomId}/invite`,
                inviteData,
            );
            return response.data;
        },
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInviteData((prev) => ({ ...prev, [name]: value }));
    };

    const handleValueChange = (value: string) => {
        setInviteData((prev) => ({ ...prev, role: value }));
    };

    const handleInvite = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        invite.mutate(inviteData);
    };

    const { data: attendances } = useQuery({
        queryKey: ["attendances", params.classroomId],
        queryFn: async (): Promise<Attendance[]> => {
            const response = await api.get(
                `/attendances/${params.classroomId}/attendances`,
            );
            return response.data;
        },
        enabled: !!params.classroomId,
    });

    const { data: attendance } = useQuery({
        queryKey: ["attendance", params.classroomId],
        queryFn: async (): Promise<Attendance> => {
            const response = await api.get(
                `/attendances/${params.classroomId}/attendance`,
            );
            return response.data;
        },
        enabled: !!params.classroomId,
    });

    const timeIn = useMutation({
        mutationFn: async (date: Date) => {
            const response = await api.post(
                `/attendances/${params.classroomId}/time-in`,
                { date: date.toISOString() },
            );
            console.log(response.data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["attendance", params.classroomId],
            });
            setOpenAttendanceDialog(false);
        },
    });

    const timeOut = useMutation({
        mutationFn: async (date: Date) => {
            const response = await api.patch(
                `/attendances/${params.classroomId}/time-out`,
                { date: date.toISOString() },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["attendance", params.classroomId],
            });
            setOpenAttendanceDialog(false);
        },
    });
    return (
        <Layout>
            <Tabs defaultValue="home">
                <TabsList>
                    <TabsTrigger value="home">Home</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="people">People</TabsTrigger>
                </TabsList>
                <TabsContent value="home">
                    {user?.role === "TEACHER" && (
                        <Button onClick={() => setOpenInviteDialog(true)}>
                            Invite User
                        </Button>
                    )}
                    <div>This is home section.</div>
                </TabsContent>
                <TabsContent value="calendar">
                    <div>
                        <p>This is calendar section.</p>
                        <CalendarComponent
                            attendance={attendance}
                            date={date}
                            setDate={setDate}
                            setOpenAttendanceDialog={setOpenAttendanceDialog}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="attendance">
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time In</TableHead>
                                    <TableHead>Time Out</TableHead>
                                    <TableHead>Total Minutes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendances &&
                                    attendances.map((attendance) => {
                                        const date = new Date(attendance.date);
                                        const timeIn = new Date(
                                            attendance.timeIn,
                                        );
                                        const timeOut = new Date(
                                            attendance.timeOut!,
                                        );

                                        return (
                                            <TableRow key={attendance.id}>
                                                <TableCell>
                                                    {date.toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {timeIn.toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        },
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {timeOut
                                                        ? timeOut.toLocaleTimeString(
                                                              "en-US",
                                                              {
                                                                  hour: "numeric",
                                                                  minute: "2-digit",
                                                                  hour12: true,
                                                              },
                                                          )
                                                        : "Not yet"}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.totalMinutes}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="people">
                    <div>
                        <h1>Teachers</h1>
                        <Separator />
                        <p>
                            {classroom?.owner.user.firstName}{" "}
                            {classroom?.owner.user.middleName}{" "}
                            {classroom?.owner.user.lastName}
                            <p> {classroom?.owner.user.email}</p>
                        </p>
                        {classroom?.teachers.map((teacher) => (
                            <>
                                <div key={teacher.teacher.user.id}>
                                    <p>
                                        {teacher.teacher.user.firstName}{" "}
                                        {teacher.teacher.user.middleName}{" "}
                                        {teacher.teacher.user.lastName}
                                    </p>
                                    <p>{teacher.teacher.user.email}</p>
                                </div>
                                <Separator />
                            </>
                        ))}
                    </div>

                    <div>
                        <h1>Students</h1>
                        <Separator />
                        {classroom?.students.map((student) => (
                            <>
                                <div key={student.student.user.id}>
                                    <p>
                                        {student.student.user.firstName}{" "}
                                        {student.student.user.middleName}{" "}
                                        {student.student.user.lastName}
                                    </p>
                                    <p>{student.student.user.email}</p>
                                </div>
                                <Separator />
                            </>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
            <InviteDialog
                inviteData={inviteData}
                openInviteDialog={openInviteDialog}
                setOpenInviteDialog={setOpenInviteDialog}
                handleInvite={handleInvite}
                handleChange={handleChange}
                handleValueChange={handleValueChange}
            />
            <AttendanceDialog
                date={date}
                time={time}
                attendance={attendance}
                openAttendanceDialog={openAttendanceDialog}
                setOpenAttendanceDialog={setOpenAttendanceDialog}
                timeIn={timeIn}
                timeOut={timeOut}
            />
        </Layout>
    );
};

export default Classroom;
