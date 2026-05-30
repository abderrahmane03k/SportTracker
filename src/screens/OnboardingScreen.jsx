import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { auth } from '../services/authService';

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [age, setAge]             = useState('');
  const [weight, setWeight]       = useState('');
  const [height, setHeight]       = useState('');
  const [goal, setGoal]           = useState('');
  const [sessions, setSessions]   = useState('');
  const [error, setError]         = useState('');

  const goals = ['Prise de masse', 'Perte de poids', 'Endurance', 'Maintien', 'Force'];
  const sessionOptions = ['2 séances', '3 séances', '4 séances', '5 séances', '6 séances'];

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) { setError('Prénom et nom requis'); return false; }
    if (!age || parseInt(age) < 10 || parseInt(age) > 100) { setError('Âge invalide'); return false; }
    setError(''); return true;
  };

  const validateStep2 = () => {
    if (!weight || parseFloat(weight) < 30 || parseFloat(weight) > 300) { setError('Poids invalide'); return false; }
    if (!height || parseFloat(height) < 1.0 || parseFloat(height) > 2.5) { setError('Taille invalide (ex: 1.80)'); return false; }
    setError(''); return true;
  };

  const validateStep3 = () => {
    if (!goal) { setError('Choisis un objectif'); return false; }
    if (!sessions) { setError('Choisis tes séances par semaine'); return false; }
    setError(''); return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < 3) { setStep(step + 1); }
    else handleSave();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const bmi = parseFloat(weight) / (parseFloat(height) * parseFloat(height));
      const sessionsNum = parseInt(sessions.split(' ')[0]);
      const targetCal = goal === 'Prise de masse' ? 2800 : goal === 'Perte de poids' ? 1800 : 2200;

      const profileData = {
        firstName:  firstName.trim(),
        lastName:   lastName.trim(),
        name:       `${firstName.trim()} ${lastName.trim()}`,
        email:      user.email,
        age:        parseInt(age),
        weight:     parseFloat(weight),
        height:     parseFloat(height),
        bmi:        parseFloat(bmi.toFixed(1)),
        goal,
        sessions:   sessionsNum,
        targetCal,
        joinDate:   new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        level:      'Débutant',
        createdAt:  Date.now(),
        uid:        user.uid,
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      onComplete(profileData);
    } catch (e) {
      setError('Erreur lors de la sauvegarde : ' + e.message);
    }
    setLoading(false);
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>👤 Ton identité</Text>
      <Text style={styles.stepSub}>Ces infos seront affichées dans ton profil</Text>

      <Text style={styles.inputLabel}>Prénom *</Text>
      <TextInput style={styles.input} placeholder="Ex: Mohamed" placeholderTextColor={colors.textMuted}
        value={firstName} onChangeText={setFirstName} />

      <Text style={styles.inputLabel}>Nom *</Text>
      <TextInput style={styles.input} placeholder="Ex: Eddargaoui" placeholderTextColor={colors.textMuted}
        value={lastName} onChangeText={setLastName} />

      <Text style={styles.inputLabel}>Âge *</Text>
      <TextInput style={styles.input} placeholder="Ex: 23" placeholderTextColor={colors.textMuted}
        value={age} onChangeText={setAge} keyboardType="numeric" />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>💪 Tes données physiques</Text>
      <Text style={styles.stepSub}>Pour calculer ton IMC et tes besoins caloriques</Text>

      <Text style={styles.inputLabel}>Poids (kg) *</Text>
      <TextInput style={styles.input} placeholder="Ex: 75" placeholderTextColor={colors.textMuted}
        value={weight} onChangeText={setWeight} keyboardType="numeric" />

      <Text style={styles.inputLabel}>Taille (m) *</Text>
      <TextInput style={styles.input} placeholder="Ex: 1.80" placeholderTextColor={colors.textMuted}
        value={height} onChangeText={setHeight} keyboardType="numeric" />

      {weight && height && parseFloat(weight) > 0 && parseFloat(height) > 0 && (
        <View style={styles.bmiPreview}>
          <Text style={styles.bmiText}>
            IMC estimé : {(parseFloat(weight) / (parseFloat(height) * parseFloat(height))).toFixed(1)}
          </Text>
        </View>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>🎯 Tes objectifs</Text>
      <Text style={styles.stepSub}>Pour personnaliser ton programme</Text>

      <Text style={styles.inputLabel}>Objectif principal *</Text>
      <View style={styles.optionsGrid}>
        {goals.map((g) => (
          <TouchableOpacity key={g}
            style={[styles.optionBtn, goal === g && styles.optionBtnActive]}
            onPress={() => setGoal(g)}>
            <Text style={[styles.optionText, goal === g && styles.optionTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Séances par semaine *</Text>
      <View style={styles.optionsRow}>
        {sessionOptions.map((s) => (
          <TouchableOpacity key={s}
            style={[styles.sessionBtn, sessions === s && styles.optionBtnActive]}
            onPress={() => setSessions(s)}>
            <Text style={[styles.sessionText, sessions === s && styles.optionTextActive]}>{s.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>💪</Text>
          </View>
          <Text style={styles.appName}>SportTracker</Text>
          <Text style={styles.appSub}>Configure ton profil</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressStep}>
              <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
                <Text style={[styles.progressDotText, step >= s && styles.progressDotTextActive]}>
                  {step > s ? '✓' : s}
                </Text>
              </View>
              {s < 3 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
            </View>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <View style={styles.btnRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.btnBack} onPress={() => { setStep(step - 1); setError(''); }}>
                <Text style={styles.btnBackText}>← Retour</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btnNext, loading && { opacity: 0.7 }, step === 1 && { flex: 1 }]}
              onPress={handleNext} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.btnNextText}>
                  {step === 3 ? '✅ Terminer' : 'Suivant →'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingTop: 20 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary + '22', borderWidth: 2, borderColor: colors.primary + '55', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoIcon: { fontSize: 32 },
  appName: { fontSize: 24, fontWeight: '700', color: colors.text },
  appSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  progressStep: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  progressDotActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  progressDotText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  progressDotTextActive: { color: colors.primary },
  progressLine: { width: 40, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: colors.primary },
  form: {},
  stepTitle: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 6 },
  stepSub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 14, color: colors.text, fontSize: 14 },
  bmiPreview: { marginTop: 10, backgroundColor: colors.primary + '22', borderRadius: 10, padding: 10, alignItems: 'center' },
  bmiText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.card },
  optionBtnActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  optionText: { fontSize: 13, color: colors.textMuted },
  optionTextActive: { color: colors.primary, fontWeight: '500' },
  optionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  sessionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center' },
  sessionText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  errorBox: { backgroundColor: colors.heart + '22', borderWidth: 0.5, borderColor: colors.heart + '55', borderRadius: 10, padding: 12, marginTop: 12 },
  errorText: { color: colors.heart, fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnBack: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center' },
  btnBackText: { fontSize: 14, color: colors.textMuted },
  btnNext: { flex: 2, backgroundColor: colors.primary, borderRadius: 14, padding: 14, alignItems: 'center' },
  btnNextText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});