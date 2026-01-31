import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export const getAllAttendance = async (userId) => {
    try {
        const q = query(
            collection(db, 'attendance'),
            where('userId', '==', userId),
            orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const attendances = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return attendances;
    } catch (error) {
        console.error('Error getting attendance:', error);
        throw error;
    }
};

export const getAllLogbooks = async (userId) => {
    try {
        const q = query(
            collection(db, 'logbooks'),
            where('userId', '==', userId),
            orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const logbooks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return logbooks;
    } catch (error) {
        console.error('Error getting logbooks:', error);
        throw error;
    }
};
