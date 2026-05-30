import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SensorProvider } from './src/context/SensorContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { auth } from './src/services/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/services/firebaseService';
import { View, ActivityIndicator } from 'react-native';
import { colors } from './src/theme/colors';

export default function App() {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          // Vérifie si le profil existe dans Firestore
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            setUserProfile(snap.data());
            setNeedsOnboarding(false);
          } else {
            // Nouveau utilisateur — doit remplir son profil
            setNeedsOnboarding(true);
          }
        } catch (e) {
          console.log('Profile check error:', e);
          setNeedsOnboarding(true);
        }
      } else {
        setUserProfile(null);
        setNeedsOnboarding(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLogin={() => {}} />
      </SafeAreaProvider>
    );
  }

  if (needsOnboarding) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={(profile) => {
          setUserProfile(profile);
          setNeedsOnboarding(false);
        }} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SensorProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SensorProvider>
    </SafeAreaProvider>
  );
}