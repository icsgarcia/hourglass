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
import type { UseMutationResult } from "@tanstack/react-query";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { type Attendance } from "@/pages/Classroom";

interface AttendaceDialogType {
    date: Date | undefined;
    time: Date | undefined;
    attendance: Attendance | undefined;
    openAttendanceDialog: boolean;
    setOpenAttendanceDialog: Dispatch<SetStateAction<boolean>>;
    timeIn: UseMutationResult<any, Error, Date, unknown>;
    timeOut: UseMutationResult<any, Error, Date, unknown>;
}

const AttendanceDialog = ({
    date,
    time,
    attendance,
    openAttendanceDialog,
    setOpenAttendanceDialog,
    timeIn,
    timeOut,
}: AttendaceDialogType) => {
    const formattedDate = date?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = time?.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const combinedDate = new Date(
        date?.getFullYear() ?? 0,
        date?.getMonth() ?? 0,
        date?.getDate() ?? 0,
        time?.getHours(),
        time?.getMinutes(),
        time?.getSeconds(),
    );

    const handleAttendanceSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!attendance) {
            timeIn.mutate(combinedDate);
        } else {
            timeOut.mutate(combinedDate);
        }
    };
    return (
        <Dialog
            open={openAttendanceDialog}
            onOpenChange={setOpenAttendanceDialog}
        >
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleAttendanceSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {attendance ? "Time Out" : "Time In"}
                        </DialogTitle>
                        <DialogDescription>
                            Record your attendance for today.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                name="date"
                                value={formattedDate}
                                disabled
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="time">
                                {attendance ? "Time Out" : "Time In"}
                            </Label>
                            <Input
                                id="time"
                                name="time"
                                value={formattedTime}
                                disabled
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">
                            {attendance ? "Time Out" : "Time In"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AttendanceDialog;
