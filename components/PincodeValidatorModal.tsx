import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Modal from './Modal';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- Enhanced Geolocation Simulation ---

const pincodeLocations = [
    { pincode: "45678", lat: 28.6139, lon: 77.2090 }, // Approx. India Gate, Delhi
    { pincode: "45679", lat: 28.5273, lon: 77.2085 }, // Approx. Hauz Khas, Delhi
    { pincode: "45680", lat: 28.6562, lon: 77.2410 }, // Approx. Red Fort, Delhi
];

// Haversine distance formula to find the distance between two points on Earth
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Mock function to simulate a reverse geocoding API call
const mockReverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    const MAX_DISTANCE_KM = 20; // Only consider pincodes within a 20km radius a valid match
    console.log(`Simulating reverse geocode for Lat: ${lat}, Lon: ${lon}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency

    let closestPincode: string | null = null;
    let minDistance = Infinity;

    pincodeLocations.forEach(loc => {
        const distance = haversineDistance(lat, lon, loc.lat, loc.lon);
        if (distance < minDistance) {
            minDistance = distance;
            closestPincode = loc.pincode;
        }
    });
    
    // Check if the closest match is within the acceptable radius
    if (closestPincode && minDistance <= MAX_DISTANCE_KM) {
        console.log(`Closest mock location for pincode ${closestPincode} is within ${MAX_DISTANCE_KM}km radius (${minDistance.toFixed(2)}km away).`);
        return closestPincode;
    }
    
    console.log(`No serviceable pincode found within ${MAX_DISTANCE_KM}km. Closest was ${minDistance.toFixed(2)}km away.`);
    return null; // Return null if no location is close enough
};


const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
    // FIX: Replaced useAuth with useAppContext to get currentUser
    const { serviceablePincodes, showNotification, setSessionPincode, setView, storeInfo, currentUser } = useAppContext();
    const [pincode, setPincode] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleCheckPincode = (pincodeToCheck: string) => {
        if (!pincodeToCheck?.trim()) {
            showNotification("Please enter a pincode.");
            return;
        }
        
        const trimmedPincode = pincodeToCheck.trim();
        let isServiceable = false;

        if (storeInfo.shippingScope === 'nationwide') {
            // For nationwide, just check if it's a valid 6-digit Indian pincode format
            isServiceable = /^\d{6}$/.test(trimmedPincode);
        } else {
            // For local, check against the serviceable list
            isServiceable = serviceablePincodes.includes(trimmedPincode);
        }

        if (isServiceable) {
            setSessionPincode(trimmedPincode);
            sessionStorage.setItem('sessionPincode', trimmedPincode);
            showNotification(`Great! We'll deliver to ${trimmedPincode}.`);
            onClose();
        } else {
            if (storeInfo.shippingScope === 'nationwide') {
                showNotification(`Please enter a valid 6-digit Indian pincode.`);
            } else {
                showNotification(`Sorry, we do not deliver to ${trimmedPincode} yet.`);
            }
        }
    };

    const handleUseCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const detectedPincode = await mockReverseGeocode(latitude, longitude);
                        if (detectedPincode) {
                            handleCheckPincode(detectedPincode);
                        } else {
                            showNotification("Your location appears to be outside our service area.");
                        }
                    } catch (error) {
                        showNotification("An error occurred while processing your location.");
                        console.error("Reverse geocode simulation error:", error);
                    } finally {
                         setIsLoadingLocation(false);
                    }
                },
                (error) => {
                    showNotification("Couldn't get your location. Please enable location services or enter a pincode manually.");
                    setIsLoadingLocation(false);
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            showNotification('Geolocation is not supported by your browser.');
            setIsLoadingLocation(false);
        }
    };
    
    const handleSelectSavedAddress = () => {
        if (currentUser?.pincode) {
            handleCheckPincode(currentUser.pincode);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Choose your location">
            <div className="space-y-4">
                <button
                    onClick={handleUseCurrentLocation}
                    disabled={isLoadingLocation}
                    className="w-full flex items-center justify-center gap-2 text-primary font-bold px-4 py-3 border-2 border-primary rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{isLoadingLocation ? 'Getting location...' : 'Use my current location'}</span>
                </button>

                <div className="relative flex items-center">
                    <hr className="w-full" />
                    <span className="absolute left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-500">OR</span>
                </div>

                {currentUser?.address && currentUser?.pincode ? (
                    <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="text-sm">
                            <p className="font-bold">{currentUser.name}</p>
                            <p className="text-gray-600">{currentUser.address}</p>
                            <p className="text-gray-600 font-semibold">{currentUser.pincode}</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={handleSelectSavedAddress} className="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-accent hover:text-primary transition-colors">Deliver Here</button>
                             <button onClick={() => { setView('myAccount'); onClose(); }} className="flex-1 border border-primary text-primary font-bold py-2 px-4 rounded-md hover:bg-primary/10 transition-colors">Edit</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-sm p-2 bg-gray-50 rounded-md">
                        <button onClick={() => { setView('login'); onClose(); }} className="text-accent font-bold hover:underline">Login</button> to see your saved addresses.
                    </div>
                )}
                
                <div className="pt-2">
                    <label htmlFor="pincode-input" className="block text-sm font-medium text-gray-700 mb-1">Enter your Pincode</label>
                    <div className="flex gap-2">
                        <input
                            id="pincode-input"
                            type="text"
                            pattern="\d*"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="e.g., 45678"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button
                            onClick={() => handleCheckPincode(pincode)}
                            className="bg-secondary text-primary font-bold px-6 py-2 rounded-md hover:bg-gray-200 border border-gray-300 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default LocationModal;