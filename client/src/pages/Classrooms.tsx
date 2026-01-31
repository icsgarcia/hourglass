import Layout from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import CreateClassroomDialog from "@/components/CreateClassroomDialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/services/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";

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
        isPending,
        isError,
    } = useQuery({
        queryKey: ["classrooms"],
        queryFn: async (): Promise<Classroom[]> => {
            const response = await api.get("/classroom");
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
