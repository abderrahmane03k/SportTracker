# 💪 SportTracker

> Système intelligent de suivi des performances sportives et de prévention des blessures

**Projet de Filière — Génie Biomédical · SUPTECH 2025-2026**

👥 **Équipe :** KHOULTI Abderrahmane · ETTAHIRI Nouhaila · EDDARGAOUI Mohamed

---

## 🎯 Description

SportTracker est un système complet combinant un bracelet biomédical connecté (ESP8266) et une application mobile intelligente pour le suivi des performances sportives en temps réel.

## ⚡ Fonctionnalités

- 📊 Monitoring temps réel : FC, SpO2, accélération, transpiration
- 🤸 Analyse posturale IA (MediaPipe — 6 exercices)
- 🍽️ Suivi nutritionnel personnalisé
- 🤖 Chatbot FitBot (Claude AI)
- 👤 Profils multi-utilisateurs (Firebase Auth)

## 🛠️ Stack technique

| Couche     | Technologie                             |
| ---------- | --------------------------------------- |
| Mobile     | React Native + Expo SDK 54              |
| Backend    | Firebase Firestore + Auth               |
| IA Posture | MediaPipe Pose (Google)                 |
| IA Chat    | Claude Haiku (Anthropic) via OpenRouter |
| Hardware   | ESP8266 + MAX30102 + MPU6050 + OLED     |
| Build      | Expo EAS Build (APK Android)            |

## 📁 Structure du projet

```
SportTracker/
├── App.js                        # Point d'entrée
├── src/
│   ├── screens/                  # 6 écrans
│   │   ├── HomeScreen.jsx        # Dashboard capteurs
│   │   ├── PostureScreen.jsx     # Analyse IA MediaPipe
│   │   ├── NutritionScreen.jsx   # Suivi alimentaire
│   │   ├── BraceletScreen.jsx    # Statut bracelet
│   │   ├── ChatScreen.jsx        # FitBot IA
│   │   ├── ProfileScreen.jsx     # Profil utilisateur
│   │   ├── LoginScreen.jsx       # Authentification
│   │   └── OnboardingScreen.jsx  # Configuration profil
│   ├── context/
│   │   └── SensorContext.js      # État global capteurs
│   ├── services/
│   │   ├── firebaseService.js    # Firebase config
│   │   └── authService.js        # Auth Firebase
│   ├── navigation/
│   │   └── AppNavigator.jsx      # Navigation onglets
│   └── theme/
│       └── colors.js             # Palette couleurs
├── app.json                      # Config Expo
└── eas.json                      # Config EAS Build
```

## 🚀 Installation et démarrage

```bash
# Cloner le projet
git clone https://github.com/abderrahmane03k/SportTracker.git
cd SportTracker

# Installer les dépendances
npm install --legacy-peer-deps

# Démarrer en mode web
npx expo start --web

# Générer l'APK Android
npx eas build -p android --profile preview
```

## ⚙️ Configuration requise

Créer un projet Firebase et configurer `src/services/firebaseService.js` avec vos propres credentials :

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  ...
};
```

Ajouter votre clé OpenRouter dans `src/screens/ChatScreen.jsx` :

```js
const API_KEY = "YOUR_OPENROUTER_API_KEY";
```

## 📱 APK Android

Télécharger directement :
[SportTracker.apk](https://expo.dev/artifacts/eas/mNYeDkzarsbWtse1jkZziS.apk)

## 🔧 Hardware — ESP8266

Le code Arduino est disponible dans le rapport technique du projet.

**Branchement :**
| Capteur | SDA | SCL |
|---------|-----|-----|
| MAX30102 | D1 | D2 |
| MPU6050 | D4 | D3 |
| OLED SSD1306 | D7 | D6 |

## 📄 Licence

Projet académique — SUPTECH 2025-2026
