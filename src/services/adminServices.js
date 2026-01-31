import { db } from './firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { toDate } from '../utils/dateHelper';

export const getAllStudents = async () => {
    try {
        const studentsRef = collection(db, 'users');
        const q = query(
            studentsRef,
            where('role', '==', 'mahasiswa'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const students = [];

        snapshot.forEach((doc) => {
            students.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return students;
    } catch (error) {
        console.error('Error getting students:', error);
        throw error;
    }
};

export const getStudentById = async (studentId) => {
    try {
        const studentRef = doc(db, 'users', studentId);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
            throw new Error('Student not found');
        }

        return {
            id: studentSnap.id,
            ...studentSnap.data()
        };
    } catch (error) {
        console.error('Error getting student:', error);
        throw error;
    }
};

export const getStudentAttendanceStats = async (studentId) => {
    try {
        const attendanceRef = collection(db, 'attendance');
        const q = query(
            attendanceRef,
            where('userId', '==', studentId),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const attendances = [];

        snapshot.forEach((doc) => {
            attendances.push({
                id: doc.id,
                ...doc.data()
            });
        });

        const totalDays = attendances.length;
        const completeDays = attendances.filter(a => a.checkIn && a.checkOut).length;
        
        const onTimeDays = attendances.filter(a => {
            if (!a.checkIn || !a.checkIn.time) return false;
            
            const checkInTime = toDate(a.checkIn.time);
            if (!checkInTime) return false;
            
            const hour = checkInTime.getHours();
            const minute = checkInTime.getMinutes();
            
            // On-time Jam 08:00 (toleransi 08:30)
            return hour < 8 || (hour === 8 && minute === 30);
        }).length;

        return {
            totalDays,
            completeDays,
            onTimeDays,
            attendances
        };
    } catch (error) {
        console.error('Error getting attendance stats:', error);
        throw error;
    }
};

export const getStudentLogbooks = async (studentId) => {
    try {
        const logbooksRef = collection(db, 'logbooks');
        const q = query(
            logbooksRef,
            where('userId', '==', studentId),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const logbooks = [];

        snapshot.forEach((doc) => {
            logbooks.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return logbooks;
    } catch (error) {
        console.error('Error getting logbooks:', error);
        throw error;
    }
};

export const toggleStudentStatus = async (studentId, isActive) => {
    try {
        const studentRef = doc(db, 'users', studentId);
        await updateDoc(studentRef, {
            isActive: isActive,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error toggling student status:', error);
        throw error;
    }
};

// Delete student and all related data (CASCADE DELETE)
export const deleteStudent = async (studentId) => {
    try {
        // 1. Delete all attendance records
        const attendanceRef = collection(db, 'attendance');
        const attendanceQuery = query(attendanceRef, where('userId', '==', studentId));
        const attendanceSnapshot = await getDocs(attendanceQuery);
        
        const attendanceDeletes = [];
        attendanceSnapshot.forEach((doc) => {
            attendanceDeletes.push(deleteDoc(doc.ref));
        });
        await Promise.all(attendanceDeletes);
        console.log(`Deleted ${attendanceDeletes.length} attendance records`);

        // 2. Delete all logbooks
        const logbooksRef = collection(db, 'logbooks');
        const logbooksQuery = query(logbooksRef, where('userId', '==', studentId));
        const logbooksSnapshot = await getDocs(logbooksQuery);
        
        const logbookDeletes = [];
        logbooksSnapshot.forEach((doc) => {
            logbookDeletes.push(deleteDoc(doc.ref));
        });
        await Promise.all(logbookDeletes);
        console.log(`Deleted ${logbookDeletes.length} logbook records`);

        // 3. Delete user document
        const userRef = doc(db, 'users', studentId);
        await deleteDoc(userRef);
        console.log('Deleted user document');

        // Note: Firebase Auth user deletion requires admin SDK (backend)
        // For now, we only delete Firestore data
        // You can add Cloud Function to delete auth user later

        return {
            success: true,
            deletedAttendance: attendanceDeletes.length,
            deletedLogbooks: logbookDeletes.length
        };
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error;
    }
};
