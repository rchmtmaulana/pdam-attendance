import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
* Get today's date in YYYY-MM-DD format
*/
export const getTodayDate = () => {
    return format(new Date(), "yyyy-MM-dd");
};

/**
* Format date to Indonesian locale
*/
export const formatDateID = (date) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
};

/**
* Format time to HH:mm
*/
export const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return format(new Date(timestamp), "HH:mm");
};

/**
* Check if time is valid for check-in (before 9 AM)
*/
export const isValidCheckInTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour < 9; // Sebelum jam 9 pagi
};

/**
* Check if time is valid for check-out (after 3 PM)
*/
export const isValidCheckOutTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 15; // Setelah jam 3 sore
};
