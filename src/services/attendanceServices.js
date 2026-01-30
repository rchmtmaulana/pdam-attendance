import {
	collection,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	query,
	where,
	getDocs,
	orderBy,
	Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getTodayDate } from '../utils/dateHelper';

export const getGeofencingSettings = async () => {
	try {
		const settingsDoc = await getDoc(doc(db, 'settings', 'geofencing'));
		if (settingsDoc.exists()) {
			return settingsDoc.data();
		}
		throw new Error('Geofencing settings not found');
	} catch (error) {
		console.error('Error getting geofencing settings:', error);
		throw error;
	}
};

export const getTodayAttendance = async (userId) => {
	try {
		const today = getTodayDate();
		const q = query(
			collection(db, 'attendance'),
			where('userId', '==', userId),
			where('date', '==', today)
		);
		const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty) {
			return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
		}
		return null;
	} catch (error) {
		console.error('Error getting today attendance:', error);
		throw error;
	}
};

export const checkIn = async (userId, userName, nim, location, distance) => {
	try {
		const today = getTodayDate();
		const attendanceRef = doc(collection(db, 'attendance'));

		const attendanceData = {
			userId,
			userName,
			nim,
			date: today,
			checkIn: {
				time: Timestamp.now(),
				location: {
					latitude: location.latitude,
					longitude: location.longitude,
				},
				distance: distance,
				status: 'success',
			},
			checkOut: null,
			hasPhoto: false,
			hasLogbook: false,
			createdAt: Timestamp.now(),
		};

		await setDoc(attendanceRef, attendanceData);
		return { id: attendanceRef.id, ...attendanceData };
	} catch (error) {
		console.error('Error check in:', error);
		throw error;
	}
};

export const checkOut = async (attendanceId, location, distance) => {
	try {
		const attendanceRef = doc(db, 'attendance', attendanceId);

		await updateDoc(attendanceRef, {
			checkOut: {
				time: Timestamp.now(),
				location: {
					latitude: location.latitude,
					longitude: location.longitude,
				},
				distance: distance,
				status: 'success',
			},
		});
	} catch (error) {
		console.error('Error check out:', error);
		throw error;
	}
};

export const getAttendanceStats = async (userId) => {
	try {
		const q = query(
			collection(db, 'attendance'),
			where('userId', '==', userId),
			orderBy('date', 'desc')
		);
		const querySnapshot = await getDocs(q);

		const totalDays = querySnapshot.size;
		const attendances = querySnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));

		const completedDays = attendances.filter(a => a.checkIn && a.checkOut).length;

		return {
			totalDays,
			completedDays,
			percentage: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
			attendances,
		};
	} catch (error) {
		console.error('Error getting attendance stats:', error);
		throw error;
	}
};
