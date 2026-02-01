import Layout from "@/layouts/Layout";
import { api } from "@/services/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { Classroom } from "./Classrooms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import InviteDialog from "@/components/InviteDialog";

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

const Classroom = () => {
    const params = useParams();
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
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

    const {
        data: classroom,
        isPending,
        isError,
    } = useQuery({
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
    return (
        <Layout>
            <Tabs defaultValue="home">
                <TabsList>
                    <TabsTrigger value="home">Home</TabsTrigger>
                    <TabsTrigger value="people">People</TabsTrigger>
                </TabsList>
                <TabsContent value="home">
                    <Button onClick={() => setOpenInviteDialog(true)}>
                        Invite User
                    </Button>
                    <div>
                        {classroom?.id}
                        {classroom?.name}
                        {classroom?.course}
                        {classroom?.yearLevel}
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
        </Layout>
    );
};

export default Classroom;
