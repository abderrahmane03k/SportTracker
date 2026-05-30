import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { auth } from '../services/authService';

const SensorContext = createContext();

export function SensorProvider({ children }) {
  const [heartRate,   setHeartRate]   = useState(0);
  const [steps,       setSteps]       = useState(0);
  const [calories,    setCalories]    = useState(0);
  const [spo2,        setSpo2]        = useState(0);
  const [accel,       setAccel]       = useState(0);
  const [angle,       setAngle]       = useState(0);
  const [sweat,       setSweat]       = useState('--');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate,  setLastUpdate]  = useState(null);
  const [userId,      setUserId]      = useState('user_abderrahmane');

  useEffect(() => {
    // Utilise l'ID Firebase Auth de l'utilisateur connecté
    const currentUser = auth.currentUser;
    const uid = currentUser ? currentUser.uid : 'user_abderrahmane';
    setUserId(uid);
    console.log('SensorContext — userId:', uid);

    const sensorDoc = doc(db, 'sensors', 'user_abderrahmane');
    // Note: les données capteurs viennent toujours du bracelet
    // qui envoie vers user_abderrahmane (le propriétaire du bracelet)

    const unsubscribe = onSnapshot(sensorDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setHeartRate(data.heartRate || 0);
        setSpo2(data.spo2          || 0);
        setSteps(data.steps        || 0);
        setCalories(data.calories  || 0);
        setAccel(data.accel        || 0);
        setAngle(data.angle        || 0);
        setSweat(data.sweat        || '--');
        setIsConnected(true);
        setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
      } else {
        setIsConnected(false);
      }
    }, (error) => {
      console.log('Firestore error:', error);
      setIsConnected(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SensorContext.Provider value={{
      heartRate, steps, calories, spo2,
      accel, angle, sweat,
      isConnected, lastUpdate,
      userId,
    }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  return useContext(SensorContext);
}