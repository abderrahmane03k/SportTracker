import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { loginUser, registerUser } from '../services/authService';

export default function LoginScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        if (!name) { setError('Nom requis'); setLoading(false); return; }
        await registerUser(email, password, {
          name, age: parseInt(age) || 22,
          weight: parseFloat(weight) || 70,
          height: parseFloat(height) || 1.75,
        });
      }
      onLogin();
    } catch (err) {
      setError(err.message.includes('user-not-found') ? 'Utilisateur introuvable' :
        err.message.includes('wrong-password') ? 'Mot de passe incorrect' :
        err.message.includes('email-already-in-use') ? 'Email déjà utilisé' :
        err.message.includes('weak-password') ? 'Mot de passe trop faible (6 car. min)' :
        'Une erreur est survenue');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>💪</Text>
          </View>
          <Text style={styles.appName}>SportTracker</Text>
          <Text style={styles.appSub}>Suivi performance & prévention blessures</Text>
        </View>

        {/* Tab Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
            onPress={() => { setIsLogin(true); setError(''); }}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Connexion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
            onPress={() => { setIsLogin(false); setError(''); }}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Inscription</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <>
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Abderrahmane Khoulti"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="exemple@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
            <>
              <Text style={styles.sectionLabel}>Données physiques</Text>
              <View style={styles.row3}>
                <View style={styles.inputSmall}>
                  <Text style={styles.inputLabel}>Âge</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="23"
                    placeholderTextColor={colors.textMuted}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputSmall}>
                  <Text style={styles.inputLabel}>Poids (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="93"
                    placeholderTextColor={colors.textMuted}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputSmall}>
                  <Text style={styles.inputLabel}>Taille (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1.80"
                    placeholderTextColor={colors.textMuted}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {isLogin ? '🚀 Se connecter' : '✨ Créer mon compte'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Features */}
        {!isLogin && (
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Ce que tu vas avoir :</Text>
            {[
              '📡 Connexion bracelet ESP32',
              '❤️ Suivi fréquence cardiaque live',
              '🧍 Correction posturale par IA',
              '🥗 Programme nutritionnel personnalisé',
              '☁️ Sauvegarde cloud Firebase',
            ].map((f, i) => (
              <Text key={i} style={styles.featureItem}>{f}</Text>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingTop: 40 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '22', borderWidth: 2, borderColor: colors.primary + '55', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 6 },
  appSub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 4, borderWidth: 0.5, borderColor: colors.border, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  toggleBtnActive: { backgroundColor: colors.primary + '33' },
  toggleText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: colors.primary, fontWeight: '700' },
  form: { gap: 4 },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 14, color: colors.text, fontSize: 14 },
  sectionLabel: { fontSize: 13, color: colors.text, fontWeight: '600', marginTop: 16, marginBottom: 4 },
  row3: { flexDirection: 'row', gap: 8 },
  inputSmall: { flex: 1 },
  errorBox: { backgroundColor: colors.heart + '22', borderWidth: 0.5, borderColor: colors.heart + '55', borderRadius: 10, padding: 12, marginTop: 8 },
  errorText: { color: colors.heart, fontSize: 13 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  forgotBtn: { alignItems: 'center', marginTop: 12 },
  forgotText: { color: colors.textMuted, fontSize: 13 },
  featuresCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginTop: 24 },
  featuresTitle: { fontSize: 13, color: colors.text, fontWeight: '600', marginBottom: 10 },
  featureItem: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
});