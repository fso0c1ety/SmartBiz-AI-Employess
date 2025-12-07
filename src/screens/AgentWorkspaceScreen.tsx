import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';
import { useApi } from '../hooks/useApi';
import { useToastStore } from '../store/useToastStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

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
  const { sendMessage: sendApiMessage, getMessages } = useApi();
  const { showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Load chat history when screen loads or when it gets focus
  useFocusEffect(
    React.useCallback(() => {
      if (selectedAgent?.id) {
        loadMessages();
      }
    }, [selectedAgent?.id])
  );

  const loadMessages = async () => {
    if (!selectedAgent?.id) return;

    setIsLoadingMessages(true);
    try {
      const apiMessages = await getMessages(selectedAgent.id);
      const formattedMessages: Message[] = apiMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksInitialized, setTasksInitialized] = useState(false);
  const [typingMessage, setTypingMessage] = useState<{ id: string; fullText: string } | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  
  // Typing animation effect
  useEffect(() => {
    if (!typingMessage) return;
    
    let currentIndex = 0;
    const typingSpeed = 15; // milliseconds per character
    
    const interval = setInterval(() => {
      if (currentIndex < typingMessage.fullText.length) {
        currentIndex++;
        setDisplayedText(typingMessage.fullText.substring(0, currentIndex));
      } else {
        clearInterval(interval);
        
        // Extract and auto-create tasks after typing completes
        const extractedTasks = extractTasksFromAIResponse(typingMessage.fullText);
        if (extractedTasks.length > 0) {
          addAIGeneratedTasks(extractedTasks);
        }
        
        setTypingMessage(null);
        setDisplayedText('');
      }
    }, typingSpeed);
    
    return () => clearInterval(interval);
  }, [typingMessage]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const flatListRef = React.useRef<FlatList>(null);

  if (!selectedAgent) {
    navigation.goBack();
    return null;
  }

  useEffect(() => {
    if (!tasksInitialized) {
      loadTasks();
    }
  }, [selectedAgent, tasksInitialized]);

  const loadTasks = async () => {
    // Only load business goal tasks once on initial mount
    if (tasksInitialized) return;
    
    try {
      setIsLoadingTasks(true);
      
      // Load business goals as initial tasks
      if (selectedAgent?.business?.goals) {
        const businessGoals = Array.isArray(selectedAgent.business.goals)
          ? selectedAgent.business.goals
          : typeof selectedAgent.business.goals === 'string'
          ? JSON.parse(selectedAgent.business.goals)
          : [];

        const goalTasks: Task[] = businessGoals.map((goal: string, index: number) => ({
          id: `goal-${index}`,
          title: goal,
          description: `Task from ${selectedAgent.business.name} business goals`,
          completed: false,
          priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
          dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
        }));

        if (goalTasks.length > 0) {
          setTasks(goalTasks);
        }
      }
      
      setTasksInitialized(true);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasksInitialized(true);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      completed: false,
      priority: newTaskPriority,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setShowAddTaskModal(false);
    showToast('Task added successfully', 'success');
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    showToast('Task deleted', 'success');
  };

  const extractTasksFromAIResponse = (aiText: string) => {
    console.log('🔍 Extracting tasks from AI response:', aiText);
    
    const extractedTasks: string[] = [];
    
    // Remove markdown formatting (**, *, __, _, etc.)
    const cleanedText = aiText.replace(/\*\*|__|\*|_|~~|`/g, '');
    console.log('🧹 Cleaned text:', cleanedText);
    
    // Split by sentences and look for action-oriented phrases
    const sentences = cleanedText.split(/[.!?]\s+/);
    
    console.log(`📝 Found ${sentences.length} sentences to analyze`);
    
    sentences.forEach((sentence, idx) => {
      const trimmed = sentence.trim();
      
      // Check for action verbs and phrases
      const actionPatterns = [
        /I(?:'ll| will)\s+(.+)/i,  // Catches "I'll" anywhere in sentence
        /^Let me\s+(.+)/i,
        /^I can\s+(.+)/i,
        /^I should\s+(.+)/i,
        /^Task:\s*(.+)/i,
        /^Action:\s*(.+)/i,
        /^To-do:\s*(.+)/i,
        /^(?:We )?(?:need to|should)\s+(.+)/i,
        /^(?:I'm going to|Going to)\s+(.+)/i,
        /^(?:First|Then|Next|Finally|Also),?\s+I(?:'ll| will)\s+(.+)/i,
      ];
      
      for (const pattern of actionPatterns) {
        const match = trimmed.match(pattern);
        if (match && match[1]) {
          let taskText = match[1].trim();
          taskText = taskText.replace(/[!.?]*$/, ''); // Remove trailing punctuation
          
          // Only add if it's a reasonable length and not duplicate
          if (taskText.length > 5 && taskText.length < 200 && !extractedTasks.includes(taskText)) {
            extractedTasks.push(taskText);
            console.log(`✅ Sentence ${idx}: Found task from pattern "${pattern.source}":`, taskText);
            break;
          }
        }
      }
    });

    console.log(`📋 Total extracted ${extractedTasks.length} tasks:`, extractedTasks);
    return extractedTasks;
  };

  const addAIGeneratedTasks = (taskTexts: string[]) => {
    if (taskTexts.length === 0) {
      console.log('⚠️ No tasks to add');
      return;
    }

    const newTasks: Task[] = taskTexts.map((text, index) => ({
      id: `ai-task-${Date.now()}-${index}`,
      title: text,
      description: `Auto-generated from AI conversation`,
      completed: false,
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }));

    console.log('➕ Adding AI tasks:', newTasks);
    console.log('📊 Current tasks before adding:', tasks);
    
    setTasks((prev) => {
      const updated = [...newTasks, ...prev];
      console.log('📊 Updated tasks:', updated);
      return updated;
    });
    
    showToast(`${newTasks.length} task(s) created by AI`, 'success');
  };

  const tabs = [
    { key: 'chat', label: 'Chat', icon: 'chatbubbles' as const },
    { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline' as const },
    { key: 'content', label: 'Content', icon: 'create' as const },
    { key: 'analytics', label: 'Analytics', icon: 'analytics' as const },
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedAgent?.id || isSendingMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsSendingMessage(true);

    // Add thinking indicator
    const thinkingMessage: Message = {
      id: 'thinking-temp',
      text: 'thinking...',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const response = await sendApiMessage(selectedAgent.id, currentMessage);
      
      // Remove thinking indicator and add response with typing animation
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => prev.filter(m => m.id !== 'thinking-temp').concat(aiResponse));
      
      // Start typing animation
      setTypingMessage({ id: aiResponse.id, fullText: response.message });
      setDisplayedText('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Remove thinking indicator without adding error message
      setMessages((prev) => prev.filter(m => m.id !== 'thinking-temp'));
      
      // Show error only as toast, not in chat
      showToast(error.response?.data?.error || 'Failed to send message. Please try again.', 'error');
    } finally {
      setIsSendingMessage(false);
    }
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

  const ThinkingDots = () => {
    const opacity1 = useRef(new Animated.Value(0.3)).current;
    const opacity2 = useRef(new Animated.Value(0.3)).current;
    const opacity3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const animate = () => {
        Animated.sequence([
          Animated.timing(opacity1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(opacity1, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(opacity2, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(opacity3, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animate());
      };
      animate();
    }, []);

    return (
      <View style={styles.thinkingContainer}>
        <Text style={[styles.thinkingText, { color: colors.textSecondary }]}>thinking</Text>
        <Animated.Text style={[styles.thinkingDot, { opacity: opacity1, color: colors.textSecondary }]}>.</Animated.Text>
        <Animated.Text style={[styles.thinkingDot, { opacity: opacity2, color: colors.textSecondary }]}>.</Animated.Text>
        <Animated.Text style={[styles.thinkingDot, { opacity: opacity3, color: colors.textSecondary }]}>.</Animated.Text>
      </View>
    );
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
        {item.id === 'thinking-temp' ? (
          <ThinkingDots />
        ) : (
          <Text
            style={[
              styles.messageText,
              { color: item.isUser ? '#FFFFFF' : colors.text },
            ]}
          >
            {typingMessage?.id === item.id ? displayedText : item.text}
          </Text>
        )}
      </View>
    </View>
  );

  const renderChatTab = () => (
    <View style={styles.chatContainer}>
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted
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
      {(() => {
        console.log('🎯 Rendering tasks tab, tasks count:', tasks.length, 'tasks:', tasks);
        return null;
      })()}
      {isLoadingTasks ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Loading tasks...
        </Text>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkbox-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text, marginTop: Spacing.md }]}>
            No tasks yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tap the + button to create your first task
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {tasks.map((task) => (
            <Card key={task.id} style={[styles.taskCard, { marginBottom: Spacing.md }]}>
              <View style={styles.taskContent}>
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => toggleTask(task.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: task.completed ? colors.success : colors.surface,
                        borderColor: task.completed ? colors.success : colors.textSecondary,
                      },
                    ]}
                  >
                    {task.completed && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      {
                        color: colors.text,
                        textDecorationLine: task.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text
                      style={[styles.taskDescription, { color: colors.textSecondary }]}
                    >
                      {task.description}
                    </Text>
                  )}
                  <View style={styles.taskMeta}>
                    <Badge
                      text={task.priority.toUpperCase()}
                      variant={
                        task.priority === 'high'
                          ? 'error'
                          : task.priority === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                    />
                    {task.dueDate && (
                      <Text style={[styles.taskDate, { color: colors.textSecondary }]}>
                        Due: {task.dueDate.toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
      
      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddTaskModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
            businessName={selectedAgent.agentName}
            logo={selectedAgent.logo}
            size="small"
          />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {selectedAgent.agentName}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {selectedAgent.businessName}
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

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowAddTaskModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Task Title</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter task title"
                placeholderTextColor={colors.textSecondary}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter task description"
                placeholderTextColor={colors.textSecondary}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      {
                        backgroundColor: newTaskPriority === priority ? colors.primary : colors.surface,
                      },
                    ]}
                    onPress={() => setNewTaskPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        {
                          color: newTaskPriority === priority ? '#FFFFFF' : colors.text,
                        },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Add Task"
                onPress={addTask}
                fullWidth
                style={{ marginTop: Spacing.lg }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  taskCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: Spacing.xs,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  taskDescription: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  taskDate: {
    fontSize: FontSize.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  taskCheckbox: {
    padding: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  fabButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  modalInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  priorityButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  thinkingText: {
    fontSize: FontSize.base,
    fontStyle: 'italic',
  },
  thinkingDot: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginLeft: 1,
  },
});

