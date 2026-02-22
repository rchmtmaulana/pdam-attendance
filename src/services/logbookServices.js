import {
    collection,
    doc,
    setDoc,
    query,
    where,
    getDocs,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getTodayDate } from '../utils/dateHelper';


export const uploadPhoto = async (userId, file) => {
    try {
        if (file.size > 800 * 1024) {
            throw new Error('Ukuran foto maksimal 800KB untuk mode gratis');
        }

        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const today = getTodayDate();
        const fileName = `${userId}_${today}.jpg`;

        return {
            url: base64,
            path: fileName,
            fileName: fileName,
            isBase64: true
        };
    } catch (error) {
        console.error('Error converting photo:', error);
        throw error;
    }
};


export const getTodayLogbook = async (userId) => {
    try {
        const today = getTodayDate();
        const q = query(
            collection(db, 'logbooks'),
            where('userId', '==', userId),
            where('date', '==', today)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting today logbook:', error);
        throw error;
    }
};

export const saveLogbook = async (userId, userName, nim, description, photoData) => {
    try {
        const today = getTodayDate();
        const existingLogbook = await getTodayLogbook(userId);

        const logbookData = {
            userId,
            userName,
            nim,
            date: today,
            description,
            photoUrl: photoData?.url || null,
            photoPath: photoData?.path || null,
            updatedAt: Timestamp.now(),
        };

        if (existingLogbook) {
            // Update existing
            await updateDoc(doc(db, 'logbooks', existingLogbook.id), logbookData);
            return { id: existingLogbook.id, ...logbookData };
        } else {
            // Create new
            const logbookRef = doc(collection(db, 'logbooks'));
            await setDoc(logbookRef, {
                ...logbookData,
                createdAt: Timestamp.now(),
            });
            return { id: logbookRef.id, ...logbookData };
        }
    } catch (error) {
        console.error('Error saving logbook:', error);
        throw error;
    }
};

export const updateAttendanceFlags = async (attendanceId, hasPhoto, hasLogbook) => {
    try {
        await updateDoc(doc(db, 'attendance', attendanceId), {
            hasPhoto: hasPhoto || false,
            hasLogbook: hasLogbook || false,
        });
    } catch (error) {
        console.error('Error updating attendance flags:', error);
        throw error;
    }
};
