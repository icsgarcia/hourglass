import Layout from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import CreateClassroomDialog from "@/components/CreateClassroomDialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/services/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";
import { Separator } from "@/components/ui/separator";

export interface CreateClassroomData {
    name: string;
    course: string;
    yearLevel: number;
}

export interface Classroom {
    id: string;
    name: string;
    course: string;
    yearLevel: number;
    owner: {
        user: {
            firstName: string;
            middleName: string;
            lastName: string;
            email: string;
        };
    };
}

interface Invite {
    id: string;
    classroom: {
        id: string;
        name: string;
        course: string;
        yearLevel: string;
        owner: {
            user: {
                firstName: string;
                middleName: string;
                lastName: string;
            };
        };
    };
}

const Classrooms = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [openCreateClassroom, setOpenCreateClassroom] = useState(false);
    const [formData, setFormData] = useState<CreateClassroomData>({
        name: "",
        course: "",
        yearLevel: 1,
    });

    useEffect(() => {
        if (!openCreateClassroom) {
            setFormData({
                name: "",
                course: "",
                yearLevel: 1,
            });
        }
    }, [openCreateClassroom]);

    const {
        data: classrooms,
        isPending: isPendingClassrooms,
        isError: isErrorClassrooms,
    } = useQuery({
        queryKey: ["classrooms"],
        queryFn: async (): Promise<Classroom[]> => {
            const response = await api.get("/classroom");
            return response.data;
        },
    });

    const {
        data: invites,
        isPending: isPendingInvites,
        isError: isErrorInvites,
    } = useQuery({
        queryKey: ["invites"],
        queryFn: async (): Promise<Invite[]> => {
            const response = await api.get("/classroom/invites");
            return response.data;
        },
    });

    const createClassroom = useMutation({
        mutationFn: async (formData: CreateClassroomData) => {
            const response = await api.post("/classroom", formData);
            return response.data;
        },
        onSuccess: () => {},
    });

    const joinClassroom = useMutation({
        mutationFn: async (invitationId: string) => {
            const response = await api.post(
                `classroom/invitations/${invitationId}/accept`,
            );
            return response.data;
        },
    });

    const rejectClassroom = useMutation({
        mutationFn: async (invitationId: string) => {
            const response = await api.post(
                `classroom/invitations/${invitationId}/reject`,
            );
            console.log(response.data);
            return response.data;
        },
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "yearLevel" ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createClassroom.mutate(formData);
        setOpenCreateClassroom(false);
    };
    return (
        <Layout>
            {user?.role === "TEACHER" && (
                <Button onClick={() => setOpenCreateClassroom(true)}>
                    Create a class
                </Button>
            )}
            {invites && invites.length > 0 && (
                <div>
                    <h1>Invites</h1>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {invites?.map((invite) => (
                            <Card key={invite.id} className="cursor-pointer">
                                <CardHeader
                                    className=" hover:underline"
                                    onClick={() => {
                                        navigate(
                                            `/classrooms/classroom/${invite.classroom.id}`,
                                        );
                                    }}
                                >
                                    <CardTitle>
                                        {invite.classroom.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {invite.classroom.course} -{" "}
                                        {invite.classroom.yearLevel}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        {invite.classroom.owner.user.firstName}{" "}
                                        {""}
                                        {
                                            invite.classroom.owner.user
                                                .middleName
                                        }{" "}
                                        {""}
                                        {invite.classroom.owner.user.lastName}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            rejectClassroom.mutate(invite.id);
                                        }}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            joinClassroom.mutate(invite.id);
                                        }}
                                    >
                                        Join Classroom
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            <Separator />
            <div>
                <h1>Classes</h1>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {classrooms?.map((classroom) => (
                        <Card key={classroom.id} className="cursor-pointer">
                            <CardHeader
                                className=" hover:underline"
                                onClick={() => {
                                    navigate(
                                        `/classrooms/classroom/${classroom.id}`,
                                    );
                                }}
                            >
                                <CardTitle>{classroom.name}</CardTitle>
                                <CardDescription>
                                    {classroom.course} - {classroom.yearLevel}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    {classroom.owner.user.firstName} {""}
                                    {classroom.owner.user.middleName} {""}
                                    {classroom.owner.user.lastName}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <CreateClassroomDialog
                open={openCreateClassroom}
                setOpen={setOpenCreateClassroom}
                data={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
            />
        </Layout>
    );
};

export default Classrooms;
