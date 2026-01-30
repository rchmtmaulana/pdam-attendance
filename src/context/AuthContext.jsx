/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user);

			if (user) {
				try {
					const userDoc = await getDoc(doc(db, "users", user.uid));
					if (userDoc.exists()) {
						setUserProfile(userDoc.data());
					}
				} catch (error) {
					console.error("Error fetching user profile:", error);
				}
			} else {
				setUserProfile(null);
			}
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = {
		currentUser,
		userProfile,
		loading,
		isAdmin: userProfile?.role === "admin",
		isMahasiswa: userProfile?.role === "mahasiswa",
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};
