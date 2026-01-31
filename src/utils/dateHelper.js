import { format } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Convert Firestore Timestamp to JavaScript Date
 * Handles: Timestamp object, { seconds, nanoseconds }, Date, ISO string
 */
export const toDate = (timestamp) => {
    if (!timestamp) return null;
    
    try {
        // Already a Date object
        if (timestamp instanceof Date) {
            return timestamp;
        }
        
        // Firestore Timestamp with toDate method
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        
        // Firestore Timestamp serialized format { seconds, nanoseconds }
        if (timestamp.seconds !== undefined) {
            return new Date(timestamp.seconds * 1000);
        }
        
        // ISO string or timestamp number
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date;
        }
        
        console.error('Unable to convert to date:', timestamp);
        return null;
    } catch (error) {
        console.error('Error converting timestamp:', timestamp, error);
        return null;
    }
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
    return format(new Date(), "yyyy-MM-dd");
};

/**
 * Format date to Indonesian locale (original function)
 */
export const formatDateID = (date) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
};

/**
 * Format date to Indonesian locale (with Firestore Timestamp support)
 */
export const formatDate = (timestamp) => {
    const date = toDate(timestamp);
    if (!date) return "-";
    return format(date, "dd MMMM yyyy", { locale: id });
};

/**
 * Format time to HH:mm (with Firestore Timestamp support)
 */
export const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = toDate(timestamp);
    if (!date) return "-";
    return format(date, "HH:mm");
};

/**
 * Format datetime to Indonesian locale
 */
export const formatDateTime = (timestamp) => {
    const date = toDate(timestamp);
    if (!date) return "-";
    return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
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
