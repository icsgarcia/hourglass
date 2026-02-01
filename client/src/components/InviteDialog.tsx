import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { type InviteData } from "@/pages/Classroom";

interface InviteDialogType {
    inviteData: InviteData;
    openInviteDialog: boolean;
    setOpenInviteDialog: Dispatch<SetStateAction<boolean>>;
    handleInvite: (e: FormEvent<HTMLFormElement>) => void;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (value: string) => void;
}

const InviteDialog = ({
    inviteData,
    openInviteDialog,
    setOpenInviteDialog,
    handleInvite,
    handleChange,
    handleValueChange,
}: InviteDialogType) => {
    return (
        <Dialog open={openInviteDialog} onOpenChange={setOpenInviteDialog}>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleInvite}>
                    <DialogHeader>
                        <DialogTitle>Invite People</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when
                            you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                value={inviteData.email}
                                onChange={handleChange}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="email">Role</Label>
                            <Select
                                value={inviteData.role}
                                onValueChange={handleValueChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Roles</SelectLabel>
                                        <SelectItem value="STUDENT">
                                            Student
                                        </SelectItem>
                                        <SelectItem value="TEACHER">
                                            Teacher
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Invite</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InviteDialog;
