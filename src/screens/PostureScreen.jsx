import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { CameraView, useCameraPermissions } from 'expo-camera';

const isWeb = Platform.OS === 'web';

function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 0;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

const EXERCISES = {
  Squat: {
    description: 'Analyse genoux, hanches, dos et profondeur',
    cameraPosition: 'side',
    cameraInstruction: '📐 Place la caméra sur le CÔTÉ (profil) pour une analyse précise',
    keyPoints: ['Descends jusqu\'à ce que les cuisses soient parallèles au sol', 'Genoux dans l\'axe des pieds', 'Dos droit — poitrine vers l\'avant', 'Poids sur les talons'],
    checkAngles: (lm) => {
      const results = [];
      if (!lm || lm.length < 29) return results;
      const isSideView = Math.abs(lm[23].x - lm[24].x) < 0.15;
      if (!isSideView) results.push({ ok: false, text: '📐 Mauvais angle de caméra', tip: 'Tourne-toi de côté', color: colors.amber });
      const kneeAngle = isSideView ? Math.min(calculateAngle(lm[23], lm[25], lm[27]), calculateAngle(lm[24], lm[26], lm[28])) : (calculateAngle(lm[23], lm[25], lm[27]) + calculateAngle(lm[24], lm[26], lm[28])) / 2;
      const backAngle = (calculateAngle(lm[11], lm[23], lm[25]) + calculateAngle(lm[12], lm[24], lm[26])) / 2;
      if (kneeAngle < 170) results.push({ ok: kneeAngle >= 70 && kneeAngle <= 115, text: `Profondeur: ${Math.round(kneeAngle)}°`, tip: kneeAngle > 115 ? '⬇️ Descends plus bas' : kneeAngle < 70 ? '⬆️ Remonte' : '✓ Parfait !', color: (kneeAngle >= 70 && kneeAngle <= 115) ? colors.green : colors.amber });
      results.push({ ok: backAngle >= 150, text: `Dos: ${Math.round(backAngle)}°`, tip: backAngle < 130 ? '🚨 Dos courbé !' : backAngle < 150 ? '⚠️ Redresse le dos' : '✓ Dos droit', color: backAngle >= 150 ? colors.green : backAngle < 130 ? colors.heart : colors.amber });
      return results;
    },
    countAngles: { joint: [23, 25, 27], down: 115, up: 160 },
  },
  Deadlift: {
    description: 'Analyse dos, hanches et posture',
    cameraPosition: 'side',
    cameraInstruction: '📐 Place la caméra sur le CÔTÉ (profil) pour une analyse précise',
    keyPoints: ['Dos complètement plat', 'Hanches en arrière au départ', 'Barre proche du corps', 'Regard vers l\'avant'],
    checkAngles: (lm) => {
      const results = [];
      if (!lm || lm.length < 26) return results;
      const backAngle = (calculateAngle(lm[11], lm[23], lm[25]) + calculateAngle(lm[12], lm[24], lm[26])) / 2;
      const hipAngle = calculateAngle(lm[11], lm[23], lm[25]);
      results.push({ ok: backAngle >= 150, text: `Dos: ${Math.round(backAngle)}°`, tip: backAngle < 120 ? '🚨 Dos courbé !' : backAngle < 150 ? '⚠️ Redresse' : '✓ Dos plat', color: backAngle >= 150 ? colors.green : backAngle < 120 ? colors.heart : colors.amber });
      results.push({ ok: hipAngle < 110 || hipAngle >= 160, text: hipAngle >= 160 ? 'Position haute ✓' : hipAngle < 110 ? 'Position basse ✓' : `Phase: ${Math.round(hipAngle)}°`, tip: 'Continue le mouvement', color: (hipAngle < 110 || hipAngle >= 160) ? colors.green : colors.blue });
      return results;
    },
    countAngles: { joint: [11, 23, 25], down: 70, up: 160 },
  },
  Pompes: {
    description: 'Analyse coudes, alignement et profondeur',
    cameraPosition: 'side',
    cameraInstruction: '📐 Place la caméra sur le CÔTÉ (profil) pour une analyse précise',
    keyPoints: ['Corps aligné', 'Descends jusqu\'au sol', 'Coudes à 45°', 'Extension complète en haut'],
    checkAngles: (lm) => {
      const results = [];
      if (!lm || lm.length < 28) return results;
      const elbowAngle = (calculateAngle(lm[11], lm[13], lm[15]) + calculateAngle(lm[12], lm[14], lm[16])) / 2;
      const bodyAngle = (calculateAngle(lm[11], lm[23], lm[27]) + calculateAngle(lm[12], lm[24], lm[28])) / 2;
      results.push({ ok: elbowAngle <= 95 || elbowAngle >= 155, text: `Coudes: ${Math.round(elbowAngle)}°`, tip: elbowAngle >= 155 ? '✓ Bras tendus' : elbowAngle <= 95 ? '✓ Bonne profondeur' : '⬇️ Descends plus bas', color: (elbowAngle <= 95 || elbowAngle >= 155) ? colors.green : colors.amber });
      results.push({ ok: bodyAngle >= 158 && bodyAngle <= 188, text: `Corps: ${Math.round(bodyAngle)}°`, tip: bodyAngle < 158 ? '⚠️ Hanches trop hautes' : bodyAngle > 188 ? '⚠️ Hanches trop basses' : '✓ Corps aligné', color: (bodyAngle >= 158 && bodyAngle <= 188) ? colors.green : colors.amber });
      return results;
    },
    countAngles: { joint: [11, 13, 15], down: 90, up: 155 },
  },
  Fentes: {
    description: 'Analyse genou avant, dos et équilibre',
    cameraPosition: 'side',
    cameraInstruction: '📐 Place la caméra sur le CÔTÉ (profil) pour une analyse précise',
    keyPoints: ['Genou avant à 90°', 'Dos bien droit', 'Genou arrière proche du sol', 'Poids équilibré'],
    checkAngles: (lm) => {
      const results = [];
      if (!lm || lm.length < 28) return results;
      const frontKneeAngle = calculateAngle(lm[23], lm[25], lm[27]);
      const backAngle = calculateAngle(lm[11], lm[23], lm[25]);
      results.push({ ok: frontKneeAngle >= 80 && frontKneeAngle <= 105, text: `Genou: ${Math.round(frontKneeAngle)}°`, tip: frontKneeAngle < 80 ? '⬆️ Remonte' : frontKneeAngle > 105 ? '⬇️ Descends' : '✓ Parfait !', color: (frontKneeAngle >= 80 && frontKneeAngle <= 105) ? colors.green : colors.amber });
      results.push({ ok: backAngle >= 158, text: `Dos: ${Math.round(backAngle)}°`, tip: backAngle < 158 ? '⚠️ Redresse le dos' : '✓ Dos droit', color: backAngle >= 158 ? colors.green : colors.amber });
      return results;
    },
    countAngles: { joint: [23, 25, 27], down: 100, up: 160 },
  },
  Biceps: {
    description: 'Analyse coude, épaule stable et amplitude',
    cameraPosition: 'front',
    cameraInstruction: '🎯 Place la caméra de FACE pour une analyse précise',
    keyPoints: ['Coude fixe contre le corps', 'Amplitude complète', 'Poignet droit', 'Pas de balancement du dos'],
    checkAngles: (lm) => {
      const results = [];
      if (!lm || lm.length < 16) return results;
      const elbowAngleL = calculateAngle(lm[11], lm[13], lm[15]);
      const elbowAngleR = calculateAngle(lm[12], lm[14], lm[16]);
      const elbowAngle = (elbowAngleL + elbowAngleR) / 2;
      results.push({ ok: elbowAngle >= 150 || elbowAngle <= 50, text: `Coude: ${Math.round(elbowAngle)}°`, tip: elbowAngle <= 50 ? '💪 Contraction max !' : elbowAngle >= 150 ? '✓ Extension complète !' : elbowAngle > 100 ? '⬇️ Baisse' : '⬆️ Monte !', color: (elbowAngle >= 150 || elbowAngle <= 50) ? colors.green : colors.blue });
      results.push({ ok: !(lm[13].y < lm[11].y - 0.08), text: lm[13].y < lm[11].y - 0.08 ? 'Coude qui monte !' : 'Coude fixe ✓', tip: lm[13].y < lm[11].y - 0.08 ? '⚠️ Garde le coude fixe' : '✓ Parfait', color: !(lm[13].y < lm[11].y - 0.08) ? colors.green : colors.heart });
      results.push({ ok: Math.abs(elbowAngleL - elbowAngleR) < 25, text: Math.abs(elbowAngleL - elbowAngleR) < 25 ? 'Symétrie OK' : `Asymétrie: ${Math.round(Math.abs(elbowAngleL - elbowAngleR))}°`, tip: Math.abs(elbowAngleL - elbowAngleR) < 25 ? '✓ Les deux bras pareils' : '⚠️ Un bras monte plus', color: Math.abs(elbowAngleL - elbowAngleR) < 25 ? colors.green : colors.amber });
      return results;
    },
    countAngles: { joint: [11, 13, 15], down: 50, up: 150 },
  },
  'Shoulder press': {
    description: 'Analyse coudes, extension et alignement',
    cameraPosition: 'front',
    cameraInstruction: '🎯 Place la caméra de FACE pour une analyse précise',
    keyPoints: ['Coudes à 90° en bas', 'Extension complète en haut', 'Pas de cambure', 'Bras alignés avec les épaules'],
    checkAngles: (lm) => {
      const results = [];
      if (!lm || lm.length < 16) return results;
      const elbowAngleL = calculateAngle(lm[11], lm[13], lm[15]);
      const elbowAngleR = calculateAngle(lm[12], lm[14], lm[16]);
      const elbowAngle = (elbowAngleL + elbowAngleR) / 2;
      results.push({ ok: elbowAngle >= 158 || elbowAngle <= 95, text: `Coudes: ${Math.round(elbowAngle)}°`, tip: elbowAngle >= 158 ? '✓ Extension !' : elbowAngle <= 95 ? '✓ Position basse' : '↕️ Continue', color: (elbowAngle >= 158 || elbowAngle <= 95) ? colors.green : colors.blue });
      results.push({ ok: calculateAngle(lm[11], lm[23], lm[25]) >= 158, text: `Dos: ${Math.round(calculateAngle(lm[11], lm[23], lm[25]))}°`, tip: calculateAngle(lm[11], lm[23], lm[25]) < 158 ? '⚠️ Tu te cambre !' : '✓ Dos droit', color: calculateAngle(lm[11], lm[23], lm[25]) >= 158 ? colors.green : colors.heart });
      results.push({ ok: Math.abs(elbowAngleL - elbowAngleR) < 18, text: Math.abs(elbowAngleL - elbowAngleR) < 18 ? 'Bras symétriques' : `Asymétrie: ${Math.round(Math.abs(elbowAngleL - elbowAngleR))}°`, tip: Math.abs(elbowAngleL - elbowAngleR) < 18 ? '✓ Bonne symétrie' : '⚠️ Un bras monte plus', color: Math.abs(elbowAngleL - elbowAngleR) < 18 ? colors.green : colors.amber });
      return results;
    },
    countAngles: { joint: [11, 13, 15], down: 95, up: 158 },
  },
};

export default function PostureScreen() {
  const [isLive, setIsLive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [alerts, setAlerts] = useState([]);
  const [score, setScore] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState("Démarre l'analyse pour commencer");
  const [facing, setFacing] = useState('front');

  // Web refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const repPhase = useRef('up');
  const selectedExerciseRef = useRef('Squat');

  // Mobile camera permission
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => { selectedExerciseRef.current = selectedExercise; }, [selectedExercise]);
  useEffect(() => { return () => { if (isWeb) stopCamera(); }; }, []);

  // ── WEB CAMERA ──────────────────────────────────────
  const startCamera = async () => {
    if (!isWeb) return;
    try {
      setFeedback('Chargement du modèle IA...');
      await new Promise((resolve, reject) => {
        if (window.Pose) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
        script.crossOrigin = 'anonymous';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      setFeedback('Initialisation...');
      await new Promise(r => setTimeout(r, 1000));
      if (!window.Pose) { setFeedback('❌ Modèle introuvable'); return; }
      const pose = new window.Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
      pose.setOptions({ modelComplexity: 2, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
      pose.onResults((results) => {
        if (results.poseLandmarks) { drawSkeleton(results.poseLandmarks); analyzeExercise(results.poseLandmarks); }
      });
      poseLandmarkerRef.current = pose;
      setFeedback('Accès caméra...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      streamRef.current = stream;
      setIsLive(true);
      setFeedback('✅ Analyse en cours...');
      await new Promise(r => setTimeout(r, 200));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadeddata = () => detectPose();
      }
    } catch (err) { setFeedback('❌ Erreur : ' + err.message); }
  };

  const stopCamera = () => {
    if (!isWeb) { setIsLive(false); setAlerts([]); setRepCount(0); setScore(0); setFeedback("Démarre l'analyse pour commencer"); return; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsLive(false); setAlerts([]); setRepCount(0); setScore(0);
    setFeedback("Démarre l'analyse pour commencer");
    repPhase.current = 'up';
  };

  const detectPose = async () => {
    if (!isWeb || !poseLandmarkerRef.current || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState >= 2) { try { await poseLandmarkerRef.current.send({ image: video }); } catch (e) {} }
    animFrameRef.current = requestAnimationFrame(detectPose);
  };

  const drawSkeleton = (landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const connections = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
    ctx.lineWidth = 2.5;
    connections.forEach(([i, j]) => {
      if (landmarks[i] && landmarks[j]) {
        ctx.globalAlpha = Math.max(0.3, (landmarks[i].visibility + landmarks[j].visibility) / 2);
        ctx.strokeStyle = '#7c6bff';
        ctx.beginPath();
        ctx.moveTo(landmarks[i].x * canvas.width, landmarks[i].y * canvas.height);
        ctx.lineTo(landmarks[j].x * canvas.width, landmarks[j].y * canvas.height);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    landmarks.forEach((lm, i) => {
      if ([11,12,13,14,15,16,23,24,25,26,27,28].includes(i)) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 6, 0, 2 * Math.PI);
        ctx.fillStyle = lm.visibility > 0.7 ? (i === 25 || i === 26 ? '#97c459' : '#7c6bff') : '#555555';
        ctx.fill();
      }
    });
  };

  const analyzeExercise = (landmarks) => {
    const exercise = EXERCISES[selectedExerciseRef.current];
    if (!exercise) return;
    const results = exercise.checkAngles(landmarks);
    setAlerts(results);
    const goodCount = results.filter(r => r.ok).length;
    const newScore = results.length > 0 ? Math.round((goodCount / results.length) * 100) : 0;
    setScore(newScore);
    if (newScore === 100) setFeedback('🏆 Forme parfaite !');
    else if (newScore >= 70) setFeedback('👍 Bonne forme !');
    else if (newScore >= 40) setFeedback('⚠️ Corrige ta posture');
    else setFeedback('🚨 Mauvaise forme !');
    countReps(landmarks);
  };

  const countReps = (landmarks) => {
    const exercise = EXERCISES[selectedExerciseRef.current];
    if (!exercise?.countAngles) return;
    const { joint, down, up } = exercise.countAngles;
    const angle = calculateAngle(landmarks[joint[0]], landmarks[joint[1]], landmarks[joint[2]]);
    if (angle <= down && repPhase.current === 'up') repPhase.current = 'down';
    else if (angle >= up && repPhase.current === 'down') { repPhase.current = 'up'; setRepCount(prev => prev + 1); }
  };

  const history = [
    { date: 'Hier', score: 71, reps: 24 },
    { date: 'Lun', score: 65, reps: 20 },
    { date: 'Dim', score: 78, reps: 28 },
  ];

  // ── RENDER MOBILE CAMERA ────────────────────────────
  const renderMobileCamera = () => {
    if (!permission) return (
      <View style={styles.camPlaceholder}>
        <Text style={styles.camPlaceholderIcon}>⏳</Text>
        <Text style={styles.camPlaceholderText}>Chargement...</Text>
      </View>
    );

    if (!permission.granted) return (
      <View style={styles.camPlaceholder}>
        <Text style={styles.camPlaceholderIcon}>🔒</Text>
        <Text style={styles.camPlaceholderText}>Permission caméra requise</Text>
        <Text style={styles.camPlaceholderSub}>Autorise l'accès à la caméra pour analyser ta posture</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>🔓 Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );

    if (!isLive) return (
      <View style={styles.camPlaceholder}>
        <Text style={styles.camPlaceholderIcon}>📷</Text>
        <Text style={styles.camPlaceholderText}>Caméra prête</Text>
        <Text style={styles.camPlaceholderSub}>{EXERCISES[selectedExercise]?.description}</Text>
      </View>
    );

    return (
      <CameraView
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        facing={facing}
      >
        <View style={styles.mobileOverlay}>
          <View style={styles.skeletonHint}>
            <Text style={styles.skeletonHintText}>🤸 Place-toi dans le cadre</Text>
          </View>
        </View>
      </CameraView>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analyse posturale</Text>
          <Text style={styles.subtitle}>
            {isWeb ? 'MediaPipe · IA temps réel' : 'Caméra · Analyse en direct'}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exSelector}>
          {Object.keys(EXERCISES).map((ex) => (
            <TouchableOpacity key={ex}
              style={[styles.exChip, selectedExercise === ex && styles.exChipActive]}
              onPress={() => { setSelectedExercise(ex); selectedExerciseRef.current = ex; setAlerts([]); setRepCount(0); setScore(0); repPhase.current = 'up'; }}>
              <Text style={[styles.exChipText, selectedExercise === ex && styles.exChipTextActive]}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {EXERCISES[selectedExercise]?.cameraInstruction && (
          <View style={styles.cameraInstructionBox}>
            <Text style={styles.cameraInstructionText}>{EXERCISES[selectedExercise].cameraInstruction}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.camFrame}>
            {isWeb ? (
              <>
                <video ref={videoRef}
                  style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: isLive ? 'block' : 'none' }}
                  playsInline muted />
                <canvas ref={canvasRef} width={640} height={480}
                  style={{ position: 'absolute', width: '100%', height: '100%', transform: 'scaleX(-1)', display: isLive ? 'block' : 'none' }} />
                {!isLive && (
                  <View style={styles.camPlaceholder}>
                    <Text style={styles.camPlaceholderIcon}>📷</Text>
                    <Text style={styles.camPlaceholderText}>Caméra désactivée</Text>
                    <Text style={styles.camPlaceholderSub}>{EXERCISES[selectedExercise]?.description}</Text>
                  </View>
                )}
              </>
            ) : renderMobileCamera()}

            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: isLive ? colors.heart : colors.textMuted }]} />
              <Text style={[styles.liveText, { color: isLive ? colors.heart : colors.textMuted }]}>
                {isLive ? 'LIVE' : 'OFF'}
              </Text>
            </View>

            {isLive && (
              <View style={styles.repCounter}>
                <Text style={styles.repValue}>{repCount}</Text>
                <Text style={styles.repLabel}>reps</Text>
              </View>
            )}

            {!isWeb && isLive && (
              <TouchableOpacity
                style={styles.flipBtn}
                onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}
              >
                <Text style={styles.flipBtnText}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.feedbackBox, { backgroundColor: score >= 70 ? colors.green + '22' : score >= 40 ? colors.amber + '22' : '#e24b4a22' }]}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>

          <TouchableOpacity
            style={[styles.camBtn, { backgroundColor: isLive ? colors.heart + '22' : colors.primary + '22', borderColor: isLive ? colors.heart + '55' : colors.primary + '55' }]}
            onPress={isLive ? stopCamera : isWeb ? startCamera : () => setIsLive(true)}
          >
            <Text style={[styles.camBtnText, { color: isLive ? colors.heart : colors.primary }]}>
              {isLive ? "⏹ Arrêter l'analyse" : "▶ Démarrer l'analyse posturale"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>SCORE DE FORME · {selectedExercise.toUpperCase()}</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreNumRow}>
              <Text style={[styles.scoreValue, { color: score >= 80 ? colors.green : score >= 60 ? colors.amber : colors.heart }]}>
                {isLive ? score : '--'}
              </Text>
              <Text style={styles.scoreMax}>/ 100</Text>
            </View>
            <View style={[styles.scoreGrade, { borderColor: score >= 80 ? colors.green + '55' : score >= 60 ? colors.amber + '55' : colors.heart + '55', backgroundColor: score >= 80 ? colors.green + '11' : score >= 60 ? colors.amber + '11' : colors.heart + '11' }]}>
              <Text style={[styles.scoreGradeText, { color: score >= 80 ? colors.green : score >= 60 ? colors.amber : colors.heart }]}>
                {!isLive ? '?' : score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'}
              </Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: isLive ? `${score}%` : '0%', backgroundColor: score >= 80 ? colors.green : score >= 60 ? colors.amber : colors.heart }]} />
          </View>
          {isLive && (
            <Text style={styles.scoreHint}>
              {score >= 80 ? '🌟 Continue comme ça !' : score >= 60 ? '💪 Quelques corrections' : '⚠️ Corrige les erreurs'}
            </Text>
          )}
        </View>

        {alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Analyse en temps réel</Text>
            {alerts.map((a, i) => (
              <View key={i} style={[styles.alertCard, { borderLeftColor: a.color || (a.ok ? colors.green : colors.amber) }]}>
                <Text style={styles.alertIcon}>{a.ok ? '✅' : '⚠️'}</Text>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertText, { color: a.color || (a.ok ? colors.text : colors.amber) }]}>{a.text}</Text>
                  <Text style={styles.alertTip}>{a.tip}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Points clés · {selectedExercise}</Text>
        <View style={styles.card}>
          {EXERCISES[selectedExercise]?.keyPoints.map((point, i) => (
            <View key={i} style={[styles.keyPointRow, i < EXERCISES[selectedExercise].keyPoints.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
              <Text style={styles.keyPointDot}>●</Text>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Historique</Text>
        {history.map((h, i) => (
          <View key={i} style={styles.historyItem}>
            <View>
              <Text style={styles.historyDate}>{h.date}</Text>
              <Text style={styles.historyReps}>{h.reps} répétitions</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={[styles.historyScore, { color: h.score >= 75 ? colors.green : colors.amber }]}>{h.score}/100</Text>
              <View style={styles.historyBar}>
                <View style={[styles.historyFill, { width: `${h.score}%`, backgroundColor: h.score >= 75 ? colors.green : colors.amber }]} />
              </View>
            </View>
          </View>
        ))}
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
  exSelector: { paddingHorizontal: 16, marginBottom: 12 },
  exChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: colors.border, marginRight: 8, backgroundColor: colors.card },
  exChipActive: { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' },
  exChipText: { fontSize: 13, color: colors.textMuted },
  exChipTextActive: { color: colors.primary, fontWeight: '500' },
  cameraInstructionBox: { backgroundColor: colors.primary + '22', borderWidth: 0.5, borderColor: colors.primary + '55', borderRadius: 12, padding: 10, marginHorizontal: 16, marginBottom: 10, alignItems: 'center' },
  cameraInstructionText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginBottom: 10 },
  camFrame: { height: 280, backgroundColor: '#080810', borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, marginBottom: 12, overflow: 'hidden', position: 'relative' },
  camPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 20 },
  camPlaceholderIcon: { fontSize: 40 },
  camPlaceholderText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  camPlaceholderSub: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  permissionBtn: { marginTop: 8, backgroundColor: colors.primary + '22', borderWidth: 1, borderColor: colors.primary + '55', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  permissionBtnText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  mobileOverlay: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  skeletonHint: { backgroundColor: '#00000088', borderRadius: 8, padding: 8, alignSelf: 'center' },
  skeletonHintText: { fontSize: 12, color: '#fff' },
  flipBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#00000088', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  flipBtnText: { fontSize: 18 },
  liveBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#00000088', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  repCounter: { position: 'absolute', bottom: 10, right: 10, backgroundColor: colors.primary + '33', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 0.5, borderColor: colors.primary + '55' },
  repValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  repLabel: { fontSize: 10, color: colors.primary },
  feedbackBox: { borderRadius: 10, padding: 10, marginBottom: 10, alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  feedbackText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  camBtn: { borderWidth: 1, borderRadius: 12, padding: 13, alignItems: 'center' },
  camBtnText: { fontSize: 14, fontWeight: '500' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  scoreNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  scoreValue: { fontSize: 36, fontWeight: '700' },
  scoreMax: { fontSize: 14, color: colors.textMuted },
  scoreGrade: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  scoreGradeText: { fontSize: 22, fontWeight: '700' },
  progressBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  scoreHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: 13, color: '#888', fontWeight: '500', marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, borderLeftWidth: 3, padding: 12, marginHorizontal: 16, marginBottom: 8 },
  alertIcon: { fontSize: 18 },
  alertContent: { flex: 1 },
  alertText: { fontSize: 13, fontWeight: '500' },
  alertTip: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  keyPointRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  keyPointDot: { fontSize: 8, color: colors.primary },
  keyPointText: { fontSize: 13, color: colors.text },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 14, marginHorizontal: 16, marginBottom: 8 },
  historyDate: { fontSize: 14, color: colors.text, fontWeight: '500' },
  historyReps: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  historyRight: { alignItems: 'flex-end', width: 120 },
  historyScore: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  historyBar: { width: 100, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  historyFill: { height: '100%', borderRadius: 2 },
});