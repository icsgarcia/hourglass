import { cn } from "@/lib/utils";
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
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/axios";
import { useAuth } from "@/contexts/AuthContext";

interface LoginData {
    email: string;
    password: string;
}

const LoginForm = () => {
    const { login: loginUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: "",
    });

    const login = useMutation({
        mutationFn: async (formData: LoginData) => {
            const response = await api.post("/auth/login", formData);
            return response.data;
        },
        onSuccess: (data) => {
            const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
            loginUser(data.accessToken, {
                id: payload.sub,
                firstName: payload.firstName,
                middleName: payload.middleName,
                lastName: payload.lastName,
                email: payload.email,
                role: payload.role,
            });
            navigate("/");
        },
        onError: (error) => {
            console.error(`Login Failed: ${error}`);
        },
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login.mutate(formData);
    };

    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    name="email"
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    name="password"
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>
                            <Field>
                                <Button type="submit">Login</Button>

                                <FieldDescription className="text-center">
                                    Don&apos;t have an account?{" "}
                                    <Link to={"/register"}>Sign up</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginForm;
