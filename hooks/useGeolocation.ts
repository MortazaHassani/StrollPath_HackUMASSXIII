import { useState, useRef, useCallback } from 'react';
import { Coordinate } from '../types';

// Haversine formula to calculate distance between two lat/lng points
const haversineDistance = (coords1: Coordinate, coords2: Coordinate): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const MILES_PER_KM = 0.621371;

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return (R * c) * MILES_PER_KM; // Distance in miles
};

const STEPS_PER_MILE = 2200;

export default function useGeolocation() {
  const [isRecording, setIsRecording] = useState(false);
  const [path, setPath] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState(0);
  const [steps, setSteps] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const timerId = useRef<number | null>(null);
  
  const resetState = useCallback(() => {
    setPath([]);
    setDistance(0);
    setSteps(0);
    setElapsedTime(0);
    setError(null);
  }, []);

  // FIX: Moved stopRecording before startRecording to fix "used before declaration" error.
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    
    resetState();
    setIsRecording(true);

    timerId.current = window.setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: Coordinate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setPath(prevPath => {
            const newTotalPath = [...prevPath, newCoord];
            if (newTotalPath.length > 1) {
              const lastCoord = newTotalPath[newTotalPath.length - 2];
              const newDistance = prevDistance => prevDistance + haversineDistance(lastCoord, newCoord);
              setDistance(newDistance);
              setSteps(newDistance(distance) * STEPS_PER_MILE);
            }
            return newTotalPath;
          });
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
        stopRecording();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [resetState, stopRecording, distance]);

  return { isRecording, startRecording, stopRecording, path, distance, steps, elapsedTime, error };
}