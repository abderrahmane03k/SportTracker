import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useSensor } from '../context/SensorContext';

export default function HomeScreen() {
  const { heartRate, steps, calories, spo2 } = useSensor();
  const [pulse] = useState(new Animated.Value(1));
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const getHeartZone = (hr) => {
    if (hr < 60) return { label: 'Repos', color: colors.blue };
    if (hr < 100) return { label: 'Zone aérobie', color: colors.green };
    if (hr < 140) return { label: 'Zone cardio', color: colors.amber };
    return { label: 'Zone intense', color: colors.heart };
  };

  const zone = getHeartZone(heartRate);
  const stepsPercent = Math.min((steps / 10000) * 100, 100);
  const calPercent = Math.min((calories / 600) * 100, 100);

  const exercises = [
    { name: 'Squat', detail: '4 × 12 reps · 60kg', status: 'Fait', color: colors.green, icon: '🏋️' },
    { name: 'Cardio HIIT', detail: '20 min · Intensité haute', status: 'En cours', color: colors.amber, icon: '🏃' },
    { name: 'Développé couché', detail: '3 × 10 reps · 50kg', status: 'À faire', color: colors.heart, icon: '💪' },
    { name: 'Gainage', detail: '3 × 60 sec', status: 'À faire', color: colors.heart, icon: '🧘' },
  ];

  const stats = [
    { label: 'Séances', value: '24', sub: 'ce mois', color: colors.primary },
    { label: 'Distance', value: '4.8', sub: 'km aujourd\'hui', color: colors.green },
    { label: 'Actif', value: '48', sub: 'min aujourd\'hui', color: colors.amber },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.time}>{currentTime}</Text>
            <Text style={styles.date}>{currentDate}</Text>
            <Text style={styles.greeting}>Bonjour, Abderrahmane 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
        </View>

        {/* Heart Rate Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>FRÉQUENCE CARDIAQUE</Text>
          <View style={styles.heartRow}>
            <Animated.View style={[styles.heartRing, { transform: [{ scale: pulse }], borderColor: zone.color + '44' }]}>
              <View style={[styles.heartCircle, { borderColor: zone.color }]}>
                <Text style={[styles.heartValue, { color: zone.color }]}>{heartRate}</Text>
                <Text style={[styles.heartUnit, { color: zone.color }]}>BPM</Text>
              </View>
            </Animated.View>
            <View style={styles.heartInfo}>
              <View style={[styles.zoneBadge, { backgroundColor: zone.color + '22', borderColor: zone.color + '55' }]}>
                <Text style={[styles.zoneLabel, { color: zone.color }]}>● {zone.label}</Text>
              </View>
              <Text style={styles.zoneDesc}>Fréquence normale au repos</Text>
              <View style={styles.heartStats}>
                <View style={styles.heartStat}>
                  <Text style={styles.heartStatVal}>62</Text>
                  <Text style={styles.heartStatLbl}>Min</Text>
                </View>
                <View style={styles.heartStatDivider} />
                <View style={styles.heartStat}>
                  <Text style={styles.heartStatVal}>124</Text>
                  <Text style={styles.heartStatLbl}>Max</Text>
                </View>
                <View style={styles.heartStatDivider} />
                <View style={styles.heartStat}>
                  <Text style={styles.heartStatVal}>78</Text>
                  <Text style={styles.heartStatLbl}>Moy</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.grid}>
          <View style={[styles.metricCard, { flex: 1 }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.cardLabel}>PAS</Text>
              <Text style={styles.metricEmoji}>👟</Text>
            </View>
            <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.metricSub}>/ 10 000 objectif</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${stepsPercent}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={styles.metricPercent}>{Math.round(stepsPercent)}%</Text>
          </View>
          <View style={[styles.metricCard, { flex: 1 }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.cardLabel}>CALORIES</Text>
              <Text style={styles.metricEmoji}>🔥</Text>
            </View>
            <Text style={styles.metricValue}>{calories}</Text>
            <Text style={styles.metricSub}>kcal brûlées</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${calPercent}%`, backgroundColor: colors.amber }]} />
            </View>
            <Text style={styles.metricPercent}>{Math.round(calPercent)}%</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.metricCard, { flex: 1 }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.cardLabel}>SPO₂</Text>
              <Text style={styles.metricEmoji}>🫁</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.blue }]}>{spo2}%</Text>
            <Text style={styles.metricSub}>Saturation O₂</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${spo2}%`, backgroundColor: colors.blue }]} />
            </View>
            <Text style={[styles.metricPercent, { color: colors.blue }]}>Normal</Text>
          </View>
          <View style={[styles.metricCard, { flex: 1 }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.cardLabel}>STRESS HRV</Text>
              <Text style={styles.metricEmoji}>🧠</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.green }]}>Faible</Text>
            <Text style={styles.metricSub}>Score de récupération</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '25%', backgroundColor: colors.green }]} />
            </View>
            <Text style={[styles.metricPercent, { color: colors.green }]}>Excellent</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Programme */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Programme du jour</Text>
          <Text style={styles.sectionSub}>1/4 complété</Text>
        </View>

        {exercises.map((ex, i) => (
          <View key={i} style={[styles.exerciseItem, ex.status === 'Fait' && styles.exerciseDone]}>
            <View style={[styles.exIconBox, { backgroundColor: ex.color + '22' }]}>
              <Text style={styles.exIcon}>{ex.icon}</Text>
            </View>
            <View style={styles.exInfo}>
              <Text style={[styles.exName, ex.status === 'Fait' && styles.exNameDone]}>{ex.name}</Text>
              <Text style={styles.exDetail}>{ex.detail}</Text>
            </View>
            <View style={[styles.badge, { borderColor: ex.color + '88', backgroundColor: ex.color + '11' }]}>
              <Text style={[styles.badgeText, { color: ex.color }]}>{ex.status}</Text>
            </View>
          </View>
        ))}

        {/* Weekly Progress */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROGRESSION HEBDOMADAIRE</Text>
          <View style={styles.weekRow}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayBar, {
                  height: [40, 60, 30, 70, 50, 80, 20][i],
                  backgroundColor: i === 4 ? colors.primary : colors.primary + '44'
                }]} />
                <Text style={[styles.dayLabel, i === 4 && { color: colors.primary }]}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 10 },
  time: { fontSize: 28, fontWeight: '300', color: colors.text },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  greeting: { fontSize: 16, color: colors.text, marginTop: 8, fontWeight: '500' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#26215c', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary + '44' },
  avatarText: { color: colors.purple, fontWeight: '600', fontSize: 15 },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginBottom: 10 },
  heartRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heartRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  heartCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  heartValue: { fontSize: 22, fontWeight: '700' },
  heartUnit: { fontSize: 10 },
  heartInfo: { flex: 1 },
  zoneBadge: { alignSelf: 'flex-start', borderWidth: 0.5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  zoneLabel: { fontSize: 12, fontWeight: '500' },
  zoneDesc: { fontSize: 11, color: colors.textMuted, marginBottom: 10 },
  heartStats: { flexDirection: 'row', alignItems: 'center' },
  heartStat: { alignItems: 'center', flex: 1 },
  heartStatVal: { fontSize: 14, fontWeight: '600', color: colors.text },
  heartStatLbl: { fontSize: 10, color: colors.textMuted },
  heartStatDivider: { width: 0.5, height: 24, backgroundColor: colors.border },
  grid: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 10 },
  metricCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, padding: 14 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricEmoji: { fontSize: 16 },
  metricValue: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 2 },
  metricSub: { fontSize: 11, color: colors.textMuted },
  progressBg: { height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  metricPercent: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, color: colors.text, marginTop: 2 },
  statSub: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 13, color: '#888', fontWeight: '500' },
  sectionSub: { fontSize: 11, color: colors.primary },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 12, marginHorizontal: 16, marginBottom: 8, gap: 12 },
  exerciseDone: { opacity: 0.6 },
  exIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  exIcon: { fontSize: 18 },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, color: colors.text, fontWeight: '500' },
  exNameDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  exDetail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badge: { borderWidth: 0.5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, paddingTop: 10 },
  dayCol: { alignItems: 'center', gap: 6, flex: 1 },
  dayBar: { width: 8, borderRadius: 4 },
  dayLabel: { fontSize: 10, color: colors.textMuted },
});