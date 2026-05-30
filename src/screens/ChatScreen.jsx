import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useSensor } from '../context/SensorContext';

const API_KEY = "YOUR_OPENROUTER_API_KEY";

const SYSTEM_PROMPT = `Tu es FitBot, un assistant fitness et nutrition intelligent intégré dans l'application SportTracker.
Tu aides les utilisateurs avec :
- Les exercices de musculation et cardio
- La nutrition et les régimes alimentaires
- La prévention des blessures sportives
- Les programmes d'entraînement personnalisés
- La récupération musculaire

Tu réponds toujours en français, de manière concise et professionnelle.
Tu utilises les données de l'utilisateur pour personnaliser tes réponses.
Tu ne réponds qu'aux questions liées au fitness, sport, nutrition et santé sportive.`;

export default function ChatScreen() {
  const { heartRate, steps, calories, spo2 } = useSensor();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour Abderrahmane ! 👋 Je suis FitBot, ton assistant fitness personnel.\n\nJe vois que tu as fait ${steps.toLocaleString()} pas aujourd'hui avec une FC de ${heartRate} BPM. Que veux-tu savoir ?`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const suggestions = [
    '💪 Programme épaules',
    '🥗 Protéines pour 93kg',
    '🏃 Cardio HIIT',
    '🩹 Prévention blessures',
  ];

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const contextMessage = `Données actuelles de l'utilisateur : FC=${heartRate}bpm, Pas=${steps}, Calories=${calories}kcal, SpO2=${spo2}%, Poids=93kg, Taille=1.80m, Objectif=Prise de masse`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CLAUDE_API_KEY}`,
          'HTTP-Referer': 'http://localhost:8081',
          'X-Title': 'SportTracker',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextMessage },
            ...newMessages.map(m => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } else {
        throw new Error('Réponse invalide');
      }

    } catch (err) {
      console.log('Erreur:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Erreur de connexion. Réessaie dans quelques secondes.',
      }]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.botName}>FitBot — Assistant IA</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>En ligne · Claude AI</Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {messages.map((msg, i) => (
            <View key={i} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
              {msg.role === 'assistant' && (
                <View style={styles.msgAvatar}>
                  <Text style={{ fontSize: 14 }}>🤖</Text>
                </View>
              )}
              <View style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.botBubble
              ]}>
                <Text style={[
                  styles.bubbleText,
                  msg.role === 'user' && { color: colors.purple }
                ]}>
                  {msg.content}
                </Text>
              </View>
              {msg.role === 'user' && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>AK</Text>
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.msgRow}>
              <View style={styles.msgAvatar}>
                <Text style={{ fontSize: 14 }}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.botBubble]}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsRow}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestion}
                onPress={() => sendMessage(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question fitness..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  botAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#26215c', justifyContent: 'center', alignItems: 'center' },
  botAvatarText: { fontSize: 20 },
  botName: { fontSize: 15, fontWeight: '600', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  statusText: { fontSize: 11, color: colors.green },
  messages: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#26215c', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  userAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary + '33', borderWidth: 0.5, borderColor: colors.primary + '55', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  userAvatarText: { fontSize: 11, color: colors.purple, fontWeight: '600' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  botBubble: { backgroundColor: colors.card, borderWidth: 0.5, borderColor: colors.border, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: colors.primary + '22', borderWidth: 0.5, borderColor: colors.primary + '55', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 13, color: colors.text, lineHeight: 20 },
  suggestionsRow: { maxHeight: 44, marginBottom: 8 },
  suggestion: { backgroundColor: colors.card, borderWidth: 0.5, borderColor: colors.primary + '55', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionText: { fontSize: 12, color: colors.primary },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 0.5, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.card, borderRadius: 20, borderWidth: 0.5, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 10, color: colors.text, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
});