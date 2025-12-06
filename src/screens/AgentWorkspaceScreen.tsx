import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { AgentAvatar } from '../components/AgentAvatar';
import { Card } from '../components/Card';
import { GradientCard } from '../components/GradientCard';
import { TabBar } from '../components/TabBar';
import { TaskItem, Task } from '../components/TaskItem';
import { MiniChart } from '../components/MiniChart';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AgentWorkspaceScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type Tab = 'chat' | 'tasks' | 'content' | 'analytics';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: string[];
}

export const AgentWorkspaceScreen: React.FC<AgentWorkspaceScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { selectedAgent } = useAgentStore();

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm your AI assistant for ${selectedAgent?.businessName}. I can help you with content creation, task management, and analytics. What would you like to do today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Create social media post for new product',
      description: 'Need to create an engaging Instagram post',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000),
    },
    {
      id: '2',
      title: 'Analyze last week\'s performance',
      completed: true,
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Update brand guidelines',
      description: 'Review and update brand voice and tone',
      completed: false,
      priority: 'low',
      dueDate: new Date(Date.now() + 259200000),
    },
  ]);

  if (!selectedAgent) {
    navigation.goBack();
    return null;
  }

  const tabs = [
    { key: 'chat', label: 'Chat', icon: 'chatbubbles' as const },
    { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline' as const },
    { key: 'content', label: 'Content', icon: 'create' as const },
    { key: 'analytics', label: 'Analytics', icon: 'analytics' as const },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand! Let me help you with that. Based on your business information, I can suggest some great ideas.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageMessage: Message = {
        id: Date.now().toString(),
        text: '📷 Image uploaded',
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, imageMessage]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});

    if (result.assets && result.assets.length > 0) {
      const docMessage: Message = {
        id: Date.now().toString(),
        text: `📄 ${result.assets[0].name}`,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, docMessage]);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: item.isUser ? colors.primary : colors.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: item.isUser ? '#FFFFFF' : colors.text },
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  const renderChatTab = () => (
    <View style={styles.chatContainer}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={pickDocument}
        >
          <Ionicons name="document-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleRecording}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic-outline'}
            size={24}
            color={isRecording ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No tasks yet. Start chatting to create tasks!
      </Text>
    </View>
  );

  const renderContentTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.contentCard}
        onPress={() => navigation.navigate('ContentGenerator')}
      >
        <Card>
          <View style={styles.contentCardContent}>
            <View
              style={[
                styles.contentIcon,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.contentInfo}>
              <Text style={[styles.contentTitle, { color: colors.text }]}>
                Content Generator
              </Text>
              <Text style={[styles.contentDescription, { color: colors.textSecondary }]}>
                Generate posts, captions, and marketing content
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );

  const renderAnalyticsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.analyticsCard}>
        <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
          Total Conversations
        </Text>
        <Text style={[styles.analyticsValue, { color: colors.text }]}>24</Text>
      </Card>

      <Card style={styles.analyticsCard}>
        <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
          Content Generated
        </Text>
        <Text style={[styles.analyticsValue, { color: colors.text }]}>12</Text>
      </Card>

      <Card style={styles.analyticsCard}>
        <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
          Active Since
        </Text>
        <Text style={[styles.analyticsValue, { color: colors.text }]}>
          {selectedAgent.createdAt.toLocaleDateString()}
        </Text>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <AgentAvatar
            businessName={selectedAgent.businessName}
            logo={selectedAgent.logo}
            size="small"
          />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {selectedAgent.businessName}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {selectedAgent.role}
            </Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        {(['Chat', 'Tasks', 'Content', 'Analytics'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? colors.primary : colors.textSecondary,
                  fontWeight: activeTab === tab ? FontWeight.semibold : FontWeight.regular,
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {activeTab === 'Chat' && renderChatTab()}
        {activeTab === 'Tasks' && renderTasksTab()}
        {activeTab === 'Content' && renderContentTab()}
        {activeTab === 'Analytics' && renderAnalyticsTab()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  headerText: {
    marginLeft: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FontSize.sm,
  },
  content: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  messageText: {
    fontSize: FontSize.base,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FontSize.base,
    marginTop: Spacing.xxl,
  },
  contentCard: {
    marginBottom: Spacing.md,
  },
  contentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contentTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  contentDescription: {
    fontSize: FontSize.sm,
  },
  analyticsCard: {
    marginBottom: Spacing.md,
  },
  analyticsLabel: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  analyticsValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
});
