import Layout from "@/layouts/Layout";
import { api } from "@/services/axios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { Classroom } from "./Classrooms";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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

const Classroom = () => {
    const params = useParams();

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
    return (
        <Layout>
            <Tabs defaultValue="overview" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="home">Home</TabsTrigger>
                    <TabsTrigger value="people">People</TabsTrigger>
                </TabsList>
                <TabsContent value="home">
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
        </Layout>
    );
};

export default Classroom;
