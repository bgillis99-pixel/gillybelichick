/**
 * Dr. G AI Assistant Screen
 * Gemini-powered CARB compliance expert
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassCard from '../components/GlassCard';
import { colors } from '../theme/colors';
import { drGilly } from '../services/drGillyService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function DrGScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Dr. G, your CARB compliance assistant. Ask me anything about diesel emissions, California regulations, or testing procedures.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickQuestions = [
    'What is CARB compliance?',
    'How do I test diesel emissions?',
    'What are the penalties for non-compliance?',
    'Which trucks need CARB testing?',
  ];

  const handleSend = async () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Call Dr. Gilly AI service (Cloud Run + Vertex AI)
      const conversationHistory = newMessages.map((msg) => ({
        role: msg.isUser ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      }));

      const response = await drGilly.chat(inputText, conversationHistory);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Dr. Gilly Error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to reach Dr. Gilly. Please check your connection and try again.',
        [{ text: 'OK' }]
      );

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.drGBadge}>
            <Ionicons name="sparkles" size={24} color={colors.drGGreen} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Dr. G</Text>
            <Text style={styles.headerSubtitle}>CARB Compliance Expert</Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {!message.isUser && (
                <View style={styles.aiIcon}>
                  <Ionicons name="sparkles" size={16} color={colors.drGGreen} />
                </View>
              )}
              <View style={styles.messageContent}>
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.aiText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={16} color={colors.drGGreen} />
              </View>
              <View style={styles.loadingDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Popular Questions:</Text>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickQuestion(question)}
                  activeOpacity={0.7}
                >
                  <GlassCard style={styles.quickQuestion}>
                    <Text style={styles.quickQuestionText}>{question}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={colors.teslaGrayText}
                    />
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Ask Dr. G anything..."
              placeholderTextColor={colors.teslaGrayText}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? colors.drGGreen : colors.teslaGrayText}
              />
            </TouchableOpacity>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.teslaBlack,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  drGBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.drGGreen + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.teslaWhite,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.teslaGrayText,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.drGGreen,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.teslaGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  userText: {
    backgroundColor: colors.teslaBlue,
  },
  aiText: {
    backgroundColor: colors.teslaGray,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.teslaWhite,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teslaGrayText,
  },
  quickQuestionsContainer: {
    marginTop: 20,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teslaGrayText,
    marginBottom: 12,
  },
  quickQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickQuestionText: {
    fontSize: 14,
    color: colors.teslaWhite,
    flex: 1,
  },
  inputContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.teslaWhite,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
