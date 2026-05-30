import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useSensor } from '../context/SensorContext';

const REPAS_INITIAUX = [
  { id: 1, icon: '🥣', name: 'Petit déjeuner', detail: 'Avoine + fruits rouges', cal: 380, time: '07:30', done: true },
  { id: 2, icon: '🍗', name: 'Déjeuner', detail: 'Poulet + riz + légumes', cal: 620, time: '12:45', done: true },
  { id: 3, icon: '🥤', name: 'Collation', detail: 'Shaker protéiné', cal: 240, time: '16:00', done: true },
];

const ICONES = ['🥗', '🍗', '🥩', '🐟', '🥚', '🧀', '🥛', '🍌', '🍎', '🥑', '🥦', '🍚', '🍞', '🥤', '🧃', '☕', '🍫', '🥜', '🫙', '🍽️'];

export default function NutritionScreen() {
  const { calories: calDepensees } = useSensor();
  const [activeTab, setActiveTab] = useState('today');
  const [meals, setMeals] = useState(REPAS_INITIAUX);
  const [showModal, setShowModal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const [newName,   setNewName]   = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newCal,    setNewCal]    = useState('');
  const [newTime,   setNewTime]   = useState('');
  const [newIcon,   setNewIcon]   = useState('🍽️');

  const targetCal = 2800;
  const totalCal  = meals.filter(m => m.done).reduce((sum, m) => sum + m.cal, 0);
  const remainingCal = targetCal - totalCal;
  const percent = Math.min(Math.round((totalCal / targetCal) * 100), 100);

  const macros = [
    { name: 'Protéines', value: 142, target: 160, unit: 'g', color: colors.blue },
    { name: 'Glucides',  value: 210, target: 350, unit: 'g', color: colors.amber },
    { name: 'Lipides',   value: 58,  target: 80,  unit: 'g', color: colors.green },
  ];

  const weekData  = [1800, 2400, 2100, 2600, totalCal, 0, 0];
  const weekDays  = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const ajouterRepas = () => {
    if (!newName.trim()) {
      Alert.alert('Erreur', 'Le nom du repas est requis');
      return;
    }
    const cal = parseInt(newCal) || 0;
    const now = new Date();
    const time = newTime.trim() || `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMeal = {
      id:     Date.now(),
      icon:   newIcon,
      name:   newName.trim(),
      detail: newDetail.trim() || 'Repas ajouté manuellement',
      cal,
      time,
      done:   true,
    };

    setMeals(prev => [...prev, newMeal].sort((a, b) => a.time.localeCompare(b.time)));
    setNewName(''); setNewDetail(''); setNewCal(''); setNewTime(''); setNewIcon('🍽️');
    setShowModal(false);
  };

  const supprimerRepas = (id) => {
    Alert.alert('Supprimer', 'Supprimer ce repas ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setMeals(prev => prev.filter(m => m.id !== id)) },
    ]);
  };

  const toggleRepas = (id) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.subtitle}>Suivi alimentaire · IA</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['today', 'week', 'macros'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'today' ? "Aujourd'hui" : tab === 'week' ? 'Semaine' : 'Macros'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bilan calorique */}
        <View style={styles.card}>
          <View style={styles.calorieMain}>
            <View style={styles.ringContainer}>
              <View style={[styles.ring, { borderColor: percent > 90 ? colors.heart : colors.primary }]}>
                <Text style={styles.ringValue}>{totalCal}</Text>
                <Text style={styles.ringUnit}>kcal</Text>
                <Text style={[styles.ringPercent, { color: percent > 90 ? colors.heart : colors.primary }]}>{percent}%</Text>
              </View>
            </View>
            <View style={styles.calorieInfo}>
              {[
                { dot: colors.primary, label: 'Consommées', val: totalCal, valColor: colors.text },
                { dot: colors.green,   label: 'Restantes',  val: remainingCal, valColor: colors.green },
                { dot: colors.textMuted, label: 'Objectif', val: targetCal, valColor: colors.text },
                { dot: colors.amber,   label: 'Brûlées sport', val: calDepensees || 312, valColor: colors.amber },
              ].map((item, i) => (
                <View key={i} style={styles.calorieRow}>
                  <View style={[styles.calDot, { backgroundColor: item.dot }]} />
                  <Text style={styles.calorieLabel}>{item.label}</Text>
                  <Text style={[styles.calorieVal, { color: item.valColor }]}>{item.val}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Onglet Aujourd'hui */}
        {activeTab === 'today' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes repas</Text>
              <Text style={styles.mealCount}>{meals.filter(m => m.done).length} repas · {totalCal} kcal</Text>
            </View>

            {meals.map((m) => (
              <View key={m.id} style={[styles.mealCard, !m.done && { opacity: 0.5 }]}>
                <View style={styles.mealTime}>
                  <Text style={styles.mealTimeText}>{m.time}</Text>
                  <TouchableOpacity onPress={() => toggleRepas(m.id)}>
                    <View style={[styles.mealDot, { backgroundColor: m.done ? colors.green : colors.border }]} />
                  </TouchableOpacity>
                </View>
                <View style={styles.mealContent}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealIcon}>{m.icon}</Text>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{m.name}</Text>
                      <Text style={styles.mealDetail}>{m.detail}</Text>
                    </View>
                    <Text style={[styles.mealCal, { color: m.done ? colors.amber : colors.textMuted }]}>
                      {m.cal > 0 ? `${m.cal} kcal` : '—'}
                    </Text>
                    <TouchableOpacity onPress={() => supprimerRepas(m.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Bouton Ajouter */}
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.addBtnText}>+ Ajouter un repas</Text>
            </TouchableOpacity>

            {/* Recommandation IA */}
            <View style={[styles.card, { borderColor: colors.primary + '44' }]}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiIcon}>🤖</Text>
                <Text style={styles.cardLabel}>RECOMMANDATION IA</Text>
              </View>
              <Text style={styles.aiText}>
                Il te reste {remainingCal > 0 ? remainingCal : 0} kcal aujourd'hui.
                {remainingCal > 400
                  ? ' Privilégie un dîner riche en protéines maigres et légumes verts pour optimiser ta récupération musculaire.'
                  : remainingCal > 0
                  ? ' Tu approches de ton objectif — un repas léger suffit.'
                  : ' Objectif calorique atteint pour aujourd\'hui !'}
              </Text>
              <View style={styles.tagRow}>
                <View style={styles.tag}><Text style={styles.tagText}>+Protéines</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>Récupération</Text></View>
              </View>
            </View>
          </>
        )}

        {/* Onglet Semaine */}
        {activeTab === 'week' && (
          <>
            <Text style={styles.sectionTitle}>Calories cette semaine</Text>
            <View style={styles.card}>
              <View style={styles.weekChart}>
                {weekData.map((val, i) => (
                  <View key={i} style={styles.weekCol}>
                    <Text style={styles.weekVal}>{val > 0 ? val : ''}</Text>
                    <View style={styles.weekBarBg}>
                      <View style={[styles.weekBarFill, {
                        height: `${Math.min((val / targetCal) * 100, 100)}%`,
                        backgroundColor: i === 4 ? colors.primary : val > targetCal ? colors.heart : colors.primary + '55'
                      }]} />
                    </View>
                    <Text style={[styles.weekDay, i === 4 && { color: colors.primary }]}>{weekDays[i]}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.weekStats}>
                <View style={styles.weekStat}>
                  <Text style={[styles.weekStatVal, { color: colors.primary }]}>2 280</Text>
                  <Text style={styles.weekStatLbl}>Moy/jour</Text>
                </View>
                <View style={styles.weekStat}>
                  <Text style={[styles.weekStatVal, { color: colors.green }]}>4/5</Text>
                  <Text style={styles.weekStatLbl}>Objectifs</Text>
                </View>
                <View style={styles.weekStat}>
                  <Text style={[styles.weekStatVal, { color: colors.amber }]}>11 400</Text>
                  <Text style={styles.weekStatLbl}>Total kcal</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Onglet Macros */}
        {activeTab === 'macros' && (
          <>
            <Text style={styles.sectionTitle}>Macronutriments</Text>
            {macros.map((m, i) => (
              <View key={i} style={styles.macroCard}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroName}>{m.name}</Text>
                  <Text style={[styles.macroVal, { color: m.color }]}>{m.value}{m.unit} / {m.target}{m.unit}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {
                    width: `${Math.min((m.value / m.target) * 100, 100)}%`,
                    backgroundColor: m.color
                  }]} />
                </View>
                <Text style={styles.macroPercent}>{Math.round((m.value / m.target) * 100)}% de l'objectif</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal Ajouter Repas */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un repas</Text>

            {/* Sélecteur icône */}
            <TouchableOpacity style={styles.iconSelector} onPress={() => setShowIconPicker(!showIconPicker)}>
              <Text style={styles.iconSelectorEmoji}>{newIcon}</Text>
              <Text style={styles.iconSelectorText}>Choisir une icône</Text>
            </TouchableOpacity>

            {showIconPicker && (
              <View style={styles.iconGrid}>
                {ICONES.map((ic, i) => (
                  <TouchableOpacity key={i} style={[styles.iconOption, newIcon === ic && styles.iconOptionActive]}
                    onPress={() => { setNewIcon(ic); setShowIconPicker(false); }}>
                    <Text style={{ fontSize: 22 }}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>Nom du repas *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Déjeuner, Dîner..."
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.inputLabel}>Détail (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Poulet + riz + légumes"
              placeholderTextColor={colors.textMuted}
              value={newDetail}
              onChangeText={setNewDetail}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Calories (kcal)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 450"
                  placeholderTextColor={colors.textMuted}
                  value={newCal}
                  onChangeText={setNewCal}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Heure</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 12:30"
                  placeholderTextColor={colors.textMuted}
                  value={newTime}
                  onChangeText={setNewTime}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => { setShowModal(false); setShowIconPicker(false); }}>
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAdd} onPress={ajouterRepas}>
                <Text style={styles.btnAddText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: 12, padding: 4, borderWidth: 0.5, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary + '33' },
  tabText: { fontSize: 12, color: colors.textMuted },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1 },
  calorieMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringContainer: { alignItems: 'center' },
  ring: { width: 110, height: 110, borderRadius: 55, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  ringValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  ringUnit: { fontSize: 10, color: colors.textMuted },
  ringPercent: { fontSize: 12, fontWeight: '600' },
  calorieInfo: { flex: 1, gap: 8 },
  calorieRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calDot: { width: 8, height: 8, borderRadius: 4 },
  calorieLabel: { fontSize: 12, color: colors.textMuted, flex: 1 },
  calorieVal: { fontSize: 13, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 13, color: '#888', fontWeight: '500', marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  mealCount: { fontSize: 12, color: colors.primary },
  mealCard: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 12 },
  mealTime: { alignItems: 'center', width: 44 },
  mealTimeText: { fontSize: 10, color: colors.textMuted, marginBottom: 4 },
  mealDot: { width: 10, height: 10, borderRadius: 5 },
  mealContent: { flex: 1, backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 12 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealIcon: { fontSize: 24 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 14, color: colors.text, fontWeight: '500' },
  mealDetail: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  mealCal: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 12, color: colors.heart },
  addBtn: { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '55', borderStyle: 'dashed', alignItems: 'center', backgroundColor: colors.primary + '11' },
  addBtnText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiIcon: { fontSize: 18 },
  aiText: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 12 },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: colors.primary + '22', borderWidth: 0.5, borderColor: colors.primary + '55', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, color: colors.purple },
  weekChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginBottom: 16 },
  weekCol: { alignItems: 'center', flex: 1, gap: 4 },
  weekVal: { fontSize: 8, color: colors.textMuted },
  weekBarBg: { width: 20, height: 80, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  weekBarFill: { width: '100%', borderRadius: 4 },
  weekDay: { fontSize: 11, color: colors.textMuted },
  weekStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colors.border },
  weekStat: { alignItems: 'center' },
  weekStatVal: { fontSize: 16, fontWeight: '700' },
  weekStatLbl: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  macroCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 14, marginHorizontal: 16, marginBottom: 8 },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  macroName: { fontSize: 13, color: colors.text, fontWeight: '500' },
  macroVal: { fontSize: 13, fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  macroPercent: { fontSize: 10, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16, textAlign: 'center' },
  iconSelector: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.background, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 12, marginBottom: 8 },
  iconSelectorEmoji: { fontSize: 28 },
  iconSelectorText: { fontSize: 14, color: colors.textMuted },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12, backgroundColor: colors.background, borderRadius: 12, padding: 10 },
  iconOption: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card, borderWidth: 0.5, borderColor: colors.border },
  iconOptionActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: colors.background, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 13, color: colors.text, fontSize: 14 },
  rowInputs: { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center' },
  btnCancelText: { fontSize: 14, color: colors.textMuted },
  btnAdd: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center' },
  btnAddText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});