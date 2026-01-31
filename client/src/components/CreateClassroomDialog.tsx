import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogClose,
    DialogFooter,
    DialogHeader,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import type { CreateClassroomData } from "@/pages/Classrooms";

interface ClassroomDialogType {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    data: CreateClassroomData;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const CreateClassroomDialog = ({
    open,
    setOpen,
    data,
    handleChange,
    handleSubmit,
}: ClassroomDialogType) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Classroom</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={data.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="course">Course</Label>
                            <Input
                                id="course"
                                name="course"
                                type="text"
                                value={data.course}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="yearLevel">Year Level</Label>
                            <Input
                                id="yearLevel"
                                name="yearLevel"
                                type="number"
                                min={1}
                                max={5}
                                value={data.yearLevel}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Create Classroom</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateClassroomDialog;
