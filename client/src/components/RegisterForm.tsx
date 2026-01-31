import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/axios";

interface RegisterData {
    firstName: string;
    middleName: string;
    lastName: string;
    role: string;
    course: string;
    yearLevel: number;
    department: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterData>({
        firstName: "",
        middleName: "",
        lastName: "",
        role: "",
        course: "",
        yearLevel: 1,
        department: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const register = useMutation({
        mutationFn: async (formData: Omit<RegisterData, "confirmPassword">) => {
            const response = await api.post("/auth/register", formData);
            return response.data;
        },
        onSuccess: () => {
            navigate("/");
        },
        onError: (error) => {
            console.error(`Register Failed: ${error}`);
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
        console.log(formData);
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        const { confirmPassword, ...data } = formData;
        register.mutate(data);
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="firstName">
                                First Name
                            </FieldLabel>
                            <Input
                                name="firstName"
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />

                            <FieldLabel htmlFor="middleName">
                                Middle Name
                            </FieldLabel>
                            <Input
                                name="middleName"
                                id="middleName"
                                type="text"
                                value={formData.middleName}
                                onChange={handleChange}
                                required
                            />

                            <FieldLabel htmlFor="lastName">
                                Last Name
                            </FieldLabel>
                            <Input
                                name="lastName"
                                id="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />

                            <FieldLabel>Role</FieldLabel>
                            <Select
                                onValueChange={(value) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        role: value,
                                        ...(value === "STUDENT" && {
                                            department: "",
                                        }),
                                        ...(value === "TEACHER" && {
                                            course: "",
                                            yearLevel: 1,
                                        }),
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="STUDENT">
                                            Student
                                        </SelectItem>
                                        <SelectItem value="TEACHER">
                                            Teacher
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {formData.role === "STUDENT" && (
                                <>
                                    <FieldLabel htmlFor="course">
                                        Course
                                    </FieldLabel>
                                    <Input
                                        name="course"
                                        id="course"
                                        type="text"
                                        value={formData.course}
                                        onChange={handleChange}
                                        required
                                    />

                                    <FieldLabel htmlFor="yearLevel">
                                        Year Level
                                    </FieldLabel>
                                    <Input
                                        name="yearLevel"
                                        id="yearLevel"
                                        type="number"
                                        min={1}
                                        max={5}
                                        value={formData.yearLevel}
                                        onChange={handleChange}
                                        required
                                    />
                                </>
                            )}

                            {formData.role === "TEACHER" && (
                                <>
                                    <FieldLabel htmlFor="department">
                                        Department
                                    </FieldLabel>
                                    <Input
                                        name="department"
                                        id="department"
                                        type="text"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    />
                                </>
                            )}

                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                name="email"
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input
                                name="password"
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <FieldLabel htmlFor="confirmPassword">
                                Confirm Password
                            </FieldLabel>
                            <Input
                                name="confirmPassword"
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Field>
                        <FieldGroup>
                            <Field>
                                <Button type="submit">Create Account</Button>
                                <FieldDescription className="px-6 text-center">
                                    Already have an account?{" "}
                                    <Link to={"/login"}>Sign in</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
};

export default RegisterForm;
