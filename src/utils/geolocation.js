/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 6371e3; // Earth radius in meters
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Distance in meters
};

/**
	* Check if user is within geofencing radius
	*/
export const checkGeofencing = (userLocation, officeLocation, radius) => {
	const distance = calculateDistance(
		userLocation.latitude,
		userLocation.longitude,
		officeLocation.latitude,
		officeLocation.longitude,
	);

	return {
		isWithin: distance <= radius,
		distance: Math.round(distance * 10) / 10,
	};
};

/**
* Get current user location
*/
export const getCurrentLocation = () => {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Geolocation tidak didukung oleh browser Anda"));
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
			},
			(error) => {
				let errorMessage = "Gagal mendapatkan lokasi";
				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorMessage = "Akses lokasi ditolak. Mohon izinkan akses lokasi.";
						break;
					case error.POSITION_UNAVAILABLE:
						errorMessage = "Informasi lokasi tidak tersedia.";
						break;
					case error.TIMEOUT:
						errorMessage = "Request lokasi timeout.";
						break;
				}
				reject(new Error(errorMessage));
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			},
		);
	});
};
