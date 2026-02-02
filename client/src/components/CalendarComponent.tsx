import { type Dispatch, type SetStateAction } from "react";
import { Calendar } from "./ui/calendar";
import type { Attendance } from "@/pages/Classroom";

interface CalendarType {
    attendance: Attendance | undefined;
    date: Date | undefined;
    setDate: Dispatch<SetStateAction<Date | undefined>>;
    setOpenAttendanceDialog: Dispatch<SetStateAction<boolean>>;
}

const CalendarComponent = ({
    attendance,
    date,
    setDate,
    setOpenAttendanceDialog,
}: CalendarType) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Calendar
            mode="single"
            buttonVariant="ghost"
            selected={date}
            onSelect={setDate}
            onDayClick={(clickedDate: Date) => {
                const normalized = new Date(clickedDate);
                normalized.setHours(0, 0, 0, 0);
                if (normalized.getTime() === today.getTime()) {
                    if (attendance?.timeOut === null)
                        setOpenAttendanceDialog(true);
                }
            }}
            disabled={{
                dayOfWeek: [0, 6],
            }}
            required
            className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
        />
    );
};

export default CalendarComponent;
