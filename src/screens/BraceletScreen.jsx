import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useSensor } from '../context/SensorContext';

export default function BraceletScreen() {
  const { heartRate, steps, spo2, calories, isConnected, setIsConnected } = useSensor();
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState([
    { type: 'info', msg: 'Système prêt' },
    { type: 'info', msg: 'En attente de connexion...' },
  ]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      const interval = setInterval(() => {
        const newLog = {
          type: 'data',
          msg: `HR: ${heartRate}bpm · SpO2: ${spo2}% · Steps: ${steps}`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setLogs(prev => [newLog, ...prev.slice(0, 9)]);
      }, 2000);
      return () => {
        clearInterval(interval);
        pulseAnim.stopAnimation();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected, heartRate, spo2, steps]);

  const handleScan = () => {
    setScanning(true);
    setLogs(prev => [{ type: 'info', msg: 'Scan BLE démarré...' }, ...prev]);
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
    setTimeout(() => {
      setScanning(false);
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
      setLogs(prev => [{ type: 'success', msg: 'Appareil trouvé : SportTracker v1' }, ...prev]);
    }, 3000);
  };

  const handleConnect = () => {
    setLogs(prev => [{ type: 'info', msg: 'Connexion en cours...' }, ...prev]);
    setTimeout(() => {
      setIsConnected(true);
      setLogs(prev => [
        { type: 'success', msg: '✓ Connecté à SportTracker v1' },
        { type: 'success', msg: '✓ MAX30102 initialisé' },
        { type: 'success', msg: '✓ MPU6050 initialisé' },
        { type: 'success', msg: '✓ Firebase sync actif' },
        ...prev
      ]);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setLogs(prev => [{ type: 'warning', msg: 'Déconnecté du bracelet' }, ...prev]);
  };

  const sensors = [
    { name: 'MAX30102', detail: 'Fréquence cardiaque & SpO₂', icon: '❤️', ok: isConnected },
    { name: 'MPU6050', detail: 'Accéléromètre / Gyroscope', icon: '📐', ok: isConnected },
    { name: 'Firebase', detail: 'Synchronisation cloud', icon: '☁️', ok: isConnected },
    { name: 'Bluetooth BLE', detail: 'Communication sans fil', icon: '📡', ok: isConnected },
  ];

  const liveData = [
    { label: 'Fréquence cardiaque', value: isConnected ? `${heartRate} bpm` : '-- bpm', color: colors.heart, tag: 'HR' },
    { label: 'Saturation O₂', value: isConnected ? `${spo2}%` : '--%', color: colors.blue, tag: 'SPO2' },
    { label: 'Pas', value: isConnected ? `${steps}` : '----', color: colors.primary, tag: 'STEPS' },
    { label: 'Calories', value: isConnected ? `${calories} kcal` : '-- kcal', color: colors.amber, tag: 'CAL' },
    { label: 'Accel X', value: isConnected ? '0.12 g' : '-- g', color: colors.green, tag: 'AX' },
    { label: 'Accel Y', value: isConnected ? '-0.04 g' : '-- g', color: colors.green, tag: 'AY' },
  ];

  const logColor = (type) => {
    if (type === 'success') return colors.green;
    if (type === 'warning') return colors.amber;
    if (type === 'error') return colors.heart;
    return colors.textMuted;
  };

  const spinAnim = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Bracelet ESP32</Text>
          <Text style={styles.subtitle}>Connexion Bluetooth BLE</Text>
        </View>

        {/* Device Card */}
        <View style={styles.card}>
          <View style={styles.deviceCenter}>
            <Animated.View style={[styles.deviceRing, {
              transform: [{ scale: isConnected ? pulseAnim : 1 }],
              borderColor: isConnected ? colors.green + '44' : colors.border,
            }]}>
              <View style={[styles.deviceInner, { backgroundColor: isConnected ? colors.green + '22' : colors.card }]}>
                <Animated.Text style={[styles.deviceIcon, scanning && { transform: [{ rotate: spinAnim }] }]}>
                  📡
                </Animated.Text>
              </View>
            </Animated.View>

            <Text style={styles.deviceName}>SportTracker v1</Text>
            <Text style={styles.deviceMac}>AA:BB:CC:DD:EE:FF</Text>
            <Text style={styles.deviceModel}>ESP32 · BLE 5.0</Text>

            <View style={[styles.statusPill, { backgroundColor: isConnected ? colors.green + '22' : colors.heart + '22', borderColor: isConnected ? colors.green + '55' : colors.heart + '55' }]}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.green : colors.heart }]} />
              <Text style={[styles.statusText, { color: isConnected ? colors.green : colors.heart }]}>
                {isConnected ? 'Connecté' : scanning ? 'Recherche...' : 'Déconnecté'}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          {!isConnected ? (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnOutline]}
                onPress={handleScan}
                disabled={scanning}
              >
                <Text style={styles.btnOutlineText}>{scanning ? '🔍 Scan...' : '🔍 Scanner'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleConnect}
              >
                <Text style={styles.btnPrimaryText}>⚡ Connecter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleDisconnect}>
              <Text style={styles.btnDangerText}>⏏ Déconnecter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Battery & Signal */}
        {isConnected && (
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🔋</Text>
              <Text style={styles.infoValue}>87%</Text>
              <Text style={styles.infoLabel}>Batterie</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📶</Text>
              <Text style={styles.infoValue}>-62 dBm</Text>
              <Text style={styles.infoLabel}>Signal RSSI</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⚡</Text>
              <Text style={styles.infoValue}>2ms</Text>
              <Text style={styles.infoLabel}>Latence</Text>
            </View>
          </View>
        )}

        {/* Sensors */}
        <Text style={styles.sectionTitle}>État des capteurs</Text>
        <View style={styles.card}>
          {sensors.map((s, i) => (
            <View key={i} style={[styles.sensorRow, i < sensors.length - 1 && styles.sensorBorder]}>
              <Text style={styles.sensorIcon}>{s.icon}</Text>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{s.name}</Text>
                <Text style={styles.sensorDetail}>{s.detail}</Text>
              </View>
              <View style={[styles.sensorBadge, { backgroundColor: s.ok ? colors.green + '22' : colors.textMuted + '22', borderColor: s.ok ? colors.green + '55' : colors.border }]}>
                <Text style={[styles.sensorStatus, { color: s.ok ? colors.green : colors.textMuted }]}>
                  {s.ok ? '✓ OK' : 'Inactif'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Live Data */}
        <Text style={styles.sectionTitle}>Données en direct</Text>
        <View style={styles.dataGrid}>
          {liveData.map((d, i) => (
            <View key={i} style={styles.dataCard}>
              <Text style={styles.dataTag}>{d.tag}</Text>
              <Text style={[styles.dataValue, { color: isConnected ? d.color : colors.textMuted }]}>{d.value}</Text>
              <Text style={styles.dataLabel}>{d.label}</Text>
            </View>
          ))}
        </View>

        {/* Terminal */}
        <Text style={styles.sectionTitle}>Console BLE</Text>
        <View style={[styles.card, styles.terminal]}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={[styles.terminalDot, { backgroundColor: colors.heart }]} />
              <View style={[styles.terminalDot, { backgroundColor: colors.amber }]} />
              <View style={[styles.terminalDot, { backgroundColor: colors.green }]} />
            </View>
            <Text style={styles.terminalTitle}>BLE Monitor</Text>
          </View>
          {logs.slice(0, 8).map((log, i) => (
            <Text key={i} style={[styles.logLine, { color: logColor(log.type) }]}>
              {log.time ? `[${log.time}] ` : '> '}{log.msg}
            </Text>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  deviceCenter: { alignItems: 'center', marginBottom: 16 },
  deviceRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  deviceInner: { width: 78, height: 78, borderRadius: 39, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  deviceIcon: { fontSize: 30 },
  deviceName: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  deviceMac: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  deviceModel: { fontSize: 11, color: colors.textMuted, marginBottom: 12 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 0.5, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, borderRadius: 14, padding: 13, alignItems: 'center', borderWidth: 1 },
  btnOutline: { backgroundColor: colors.card, borderColor: colors.border },
  btnOutlineText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  btnPrimary: { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' },
  btnPrimaryText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  btnDanger: { backgroundColor: colors.heart + '22', borderColor: colors.heart + '55' },
  btnDangerText: { fontSize: 14, color: colors.heart, fontWeight: '500' },
  infoRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  infoCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, padding: 12, alignItems: 'center' },
  infoIcon: { fontSize: 20, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  infoLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 13, color: '#888', fontWeight: '500', marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  sensorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  sensorBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  sensorIcon: { fontSize: 20 },
  sensorInfo: { flex: 1 },
  sensorName: { fontSize: 14, color: colors.text, fontWeight: '500' },
  sensorDetail: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sensorBadge: { borderWidth: 0.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sensorStatus: { fontSize: 12, fontWeight: '500' },
  dataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  dataCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 12, width: '30%', flex: 1 },
  dataTag: { fontSize: 9, color: colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  dataValue: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  dataLabel: { fontSize: 10, color: colors.textMuted },
  terminal: { backgroundColor: '#060610' },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  terminalDots: { flexDirection: 'row', gap: 6 },
  terminalDot: { width: 10, height: 10, borderRadius: 5 },
  terminalTitle: { fontSize: 11, color: colors.textMuted, letterSpacing: 1 },
  logLine: { fontSize: 11, lineHeight: 20, fontFamily: 'monospace' },
});