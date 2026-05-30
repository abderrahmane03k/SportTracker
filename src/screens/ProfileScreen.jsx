import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { auth } from '../services/authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('stats');
  
  // État du profile dynamique
  const [profile, setProfile] = useState({
    name: 'Chargement...',
    field: 'Génie Biomédical · SUPTECH',
    age: 0,
    weight: 0,
    height: 0,
    level: 'Débutant',
    goal: '--',
    sessions: 0,
    targetCal: 2000,
    joinDate: '--',
  });

  // Chargement du profile depuis Firestore
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          name:      data.name || 'Utilisateur',
          field:     'Génie Biomédical · SUPTECH',
          age:       data.age || 0,
          weight:    data.weight || 0,
          height:    data.height || 0,
          level:     data.level || 'Débutant',
          goal:      data.goal || '--',
          sessions:  data.sessions || 0,
          targetCal: data.targetCal || 2000,
          joinDate:  data.joinDate || '--',
        });
      }
    };
    loadProfile();
  }, []);

  // Initiales pour l'avatar
  const initials = profile.name !== 'Chargement...'
    ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '...';

  const bmi = (profile.weight / (profile.height * profile.height)).toFixed(1);
  const bmiStatus = bmi < 18.5 ? 'Insuffisant' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Surpoids' : 'Obésité';
  const bmiColor = bmi < 18.5 ? colors.blue : bmi < 25 ? colors.green : bmi < 30 ? colors.amber : colors.heart;

  const stats = [
    { label: 'Séances totales', value: '48', icon: '🏋️', color: colors.primary },
    { label: 'Km parcourus', value: '124', icon: '🏃', color: colors.green },
    { label: 'Calories brûlées', value: '18.4k', icon: '🔥', color: colors.amber },
    { label: 'Heures actives', value: '62h', icon: '⏱️', color: colors.blue },
  ];

  const progress = [
    { label: 'Force', value: 72, change: '+12%', color: colors.primary },
    { label: 'Endurance', value: 58, change: '+8%', color: colors.heart },
    { label: 'Flexibilité', value: 35, change: '+3%', color: colors.amber },
    { label: 'Récupération', value: 80, change: '+15%', color: colors.green },
    { label: 'Nutrition', value: 65, change: '+5%', color: colors.blue },
  ];

  const achievements = [
    { icon: '🏆', title: '1ère séance', desc: 'Tu as commencé !', done: true },
    { icon: '🔥', title: '7 jours consécutifs', desc: 'Une semaine sans pause', done: true },
    { icon: '💪', title: '50 séances', desc: 'Plus que 2 séances !', done: false },
    { icon: '⚡', title: '10 000 pas/jour', desc: 'Objectif quotidien', done: true },
    { icon: '🎯', title: 'Score postural 90+', desc: 'Perfection en vue', done: false },
    { icon: '🌟', title: '30 jours actifs', desc: 'Un mois complet', done: false },
  ];

  const settings = [
    { icon: '👤', label: 'Modifier le profil', arrow: true },
    { icon: '🎯', label: 'Modifier les objectifs', arrow: true },
    { icon: '🔔', label: 'Notifications', arrow: true },
    { icon: '🔒', label: 'Confidentialité', arrow: true },
    { icon: '📊', label: 'Exporter mes données', arrow: true },
    { icon: '❓', label: 'Aide & Support', arrow: true },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header Profile */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileField}>{profile.field}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>⭐ {profile.level}</Text>
            </View>
            <View style={styles.joinBadge}>
              <Text style={styles.joinText}>📅 Depuis {profile.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Body Stats */}
        <View style={styles.bodyCard}>
          <View style={styles.bodyRow}>
            <View style={styles.bodyStat}>
              <Text style={styles.bodyValue}>{profile.age}</Text>
              <Text style={styles.bodyLabel}>Âge</Text>
            </View>
            <View style={styles.bodyDivider} />
            <View style={styles.bodyStat}>
              <Text style={styles.bodyValue}>{profile.weight} kg</Text>
              <Text style={styles.bodyLabel}>Poids</Text>
            </View>
            <View style={styles.bodyDivider} />
            <View style={styles.bodyStat}>
              <Text style={styles.bodyValue}>{profile.height} m</Text>
              <Text style={styles.bodyLabel}>Taille</Text>
            </View>
            <View style={styles.bodyDivider} />
            <View style={styles.bodyStat}>
              <Text style={[styles.bodyValue, { color: bmiColor }]}>{bmi}</Text>
              <Text style={styles.bodyLabel}>IMC · {bmiStatus}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['stats', 'progress', 'achievements', 'settings'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'stats' ? '📊' : tab === 'progress' ? '📈' : tab === 'achievements' ? '🏆' : '⚙️'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'stats' && (
          <>
            <View style={styles.statsGrid}>
              {stats.map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Objectifs personnels</Text>
            <View style={styles.card}>
              {[
                { label: 'Objectif principal', value: profile.goal, color: colors.primary },
                { label: 'Séances / semaine', value: `${profile.sessions} séances` },
                { label: 'Calories cible / jour', value: `${profile.targetCal} kcal`, color: colors.amber },
                { label: 'Niveau fitness', value: profile.level, color: colors.green },
              ].map((item, i) => (
                <View key={i} style={[styles.goalRow, i < 3 && styles.goalBorder]}>
                  <Text style={styles.goalLabel}>{item.label}</Text>
                  <Text style={[styles.goalValue, item.color && { color: item.color }]}>{item.value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Activité cette semaine</Text>
            <View style={styles.card}>
              <View style={styles.weekRow}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                  const active = [true, true, false, true, true, false, false][i];
                  return (
                    <View key={i} style={styles.weekDay}>
                      <View style={[styles.weekDot, { backgroundColor: active ? colors.primary : colors.border }]} />
                      <Text style={[styles.weekLabel, active && { color: colors.primary }]}>{day}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.weekSummary}>4 jours actifs sur 7 · Objectif : 4 séances ✅</Text>
            </View>
          </>
        )}

        {activeTab === 'progress' && (
          <>
            <Text style={styles.sectionTitle}>Progression ce mois-ci</Text>
            {progress.map((p, i) => (
              <View key={i} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{p.label}</Text>
                  <View style={styles.progressRight}>
                    <Text style={[styles.progressChange, { color: colors.green }]}>{p.change}</Text>
                    <Text style={[styles.progressPct, { color: p.color }]}>{p.value}%</Text>
                  </View>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${p.value}%`, backgroundColor: p.color }]} />
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Historique du poids</Text>
            <View style={styles.card}>
              <View style={styles.weightChart}>
                {[63.5, 63.1, 62.8, 62.5, 62.3, 62.0, 62.0].map((w, i) => (
                  <View key={i} style={styles.weightCol}>
                    <Text style={styles.weightVal}>{w}</Text>
                    <View style={[styles.weightBar, {
                      height: (w - 61) * 30,
                      backgroundColor: i === 6 ? colors.primary : colors.primary + '55'
                    }]} />
                    <Text style={styles.weightDay}>{['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'][i]}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.weightSummary}>
                Perte totale : <Text style={{ color: colors.green }}>-1.5 kg</Text> en 7 semaines
              </Text>
            </View>
          </>
        )}

        {activeTab === 'achievements' && (
          <>
            <Text style={styles.sectionTitle}>Mes accomplissements</Text>
            <View style={styles.achieveGrid}>
              {achievements.map((a, i) => (
                <View key={i} style={[styles.achieveCard, !a.done && styles.achieveCardLocked]}>
                  <Text style={[styles.achieveIcon, !a.done && { opacity: 0.3 }]}>{a.icon}</Text>
                  <Text style={[styles.achieveTitle, !a.done && { color: colors.textMuted }]}>{a.title}</Text>
                  <Text style={styles.achieveDesc}>{a.desc}</Text>
                  {a.done && <View style={styles.achieveDone}><Text style={styles.achieveDoneText}>✓</Text></View>}
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <Text style={styles.sectionTitle}>Paramètres</Text>
            <View style={styles.card}>
              {settings.map((s, i) => (
                <TouchableOpacity key={i} style={[styles.settingRow, i < settings.length - 1 && styles.settingBorder]}>
                  <Text style={styles.settingIcon}>{s.icon}</Text>
                  <Text style={styles.settingLabel}>{s.label}</Text>
                  <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.logoutBtn}>
              <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  profileHeader: { alignItems: 'center', padding: 24, paddingBottom: 16 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#26215c', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary + '55', marginBottom: 12 },
  avatarText: { color: colors.purple, fontWeight: '700', fontSize: 26 },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  profileField: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  levelBadge: { backgroundColor: colors.primary + '22', borderWidth: 0.5, borderColor: colors.primary + '55', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  levelText: { fontSize: 12, color: colors.purple, fontWeight: '500' },
  joinBadge: { backgroundColor: colors.card, borderWidth: 0.5, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  joinText: { fontSize: 12, color: colors.textMuted },
  bodyCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  bodyRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  bodyStat: { alignItems: 'center', flex: 1 },
  bodyValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  bodyLabel: { fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  bodyDivider: { width: 0.5, height: 40, backgroundColor: colors.border },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: 12, padding: 4, borderWidth: 0.5, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary + '33' },
  tabText: { fontSize: 18 },
  tabTextActive: { },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  statCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, padding: 14, width: '47%', flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 13, color: '#888', fontWeight: '500', marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  goalBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  goalLabel: { fontSize: 13, color: colors.textMuted },
  goalValue: { fontSize: 13, color: colors.text, fontWeight: '500' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  weekDay: { alignItems: 'center', gap: 6 },
  weekDot: { width: 32, height: 32, borderRadius: 16 },
  weekLabel: { fontSize: 11, color: colors.textMuted },
  weekSummary: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  progressCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 14, marginHorizontal: 16, marginBottom: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: colors.text, fontWeight: '500' },
  progressRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressChange: { fontSize: 12, fontWeight: '500' },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  weightChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, marginBottom: 12 },
  weightCol: { alignItems: 'center', flex: 1, gap: 4 },
  weightVal: { fontSize: 8, color: colors.textMuted },
  weightBar: { width: 20, borderRadius: 4, minHeight: 4 },
  weightDay: { fontSize: 9, color: colors.textMuted },
  weightSummary: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  achieveCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, padding: 14, width: '47%', flex: 1, alignItems: 'center', position: 'relative' },
  achieveCardLocked: { opacity: 0.6 },
  achieveIcon: { fontSize: 28, marginBottom: 8 },
  achieveTitle: { fontSize: 12, color: colors.text, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  achieveDesc: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  achieveDone: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.green, justifyContent: 'center', alignItems: 'center' },
  achieveDoneText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  settingBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  settingIcon: { fontSize: 18 },
  settingLabel: { flex: 1, fontSize: 14, color: colors.text },
  settingArrow: { fontSize: 20, color: colors.textMuted },
  logoutBtn: { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 0.5, borderColor: colors.heart + '55', backgroundColor: colors.heart + '11', alignItems: 'center' },
  logoutText: { fontSize: 14, color: colors.heart, fontWeight: '500' },
});