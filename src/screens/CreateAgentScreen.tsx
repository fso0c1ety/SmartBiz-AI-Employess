import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';
import { useToastStore } from '../store/useToastStore';
import { useApi } from '../hooks/useApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CreateAgentScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// Pre-built AI Agent Personas
const AI_AGENTS = [
  {
    id: 'sydney',
    name: 'Sydney',
    role: 'Marketing AI Agent',
    specialty: 'Social Media & Content Marketing',
    description: 'Expert in creating engaging social media content, running ad campaigns, and growing your online presence.',
    avatar: '👩‍💼',
    skills: ['Social Media Marketing', 'Content Creation', 'Ad Campaigns', 'Analytics'],
    personality: 'Creative and strategic with a data-driven approach',
  },
  {
    id: 'karl',
    name: 'Karl',
    role: 'Email Marketing Specialist',
    specialty: 'Email Campaigns & Automation',
    description: 'Specializes in crafting compelling email campaigns, nurturing leads, and automating your email marketing.',
    avatar: '👨‍💻',
    skills: ['Email Writing', 'Campaign Strategy', 'Lead Nurturing', 'Automation'],
    personality: 'Detail-oriented and persuasive communicator',
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Sales AI Assistant',
    specialty: 'Sales & Lead Generation',
    description: 'Focused on generating qualified leads, sales outreach, and closing deals through strategic communication.',
    avatar: '👩‍🚀',
    skills: ['Lead Generation', 'Sales Copy', 'CRM Management', 'Follow-ups'],
    personality: 'Goal-oriented and persuasive',
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Customer Support Agent',
    specialty: 'Customer Service & Support',
    description: 'Dedicated to providing exceptional customer support, handling inquiries, and maintaining customer satisfaction.',
    avatar: '👨‍🎓',
    skills: ['Customer Service', 'Problem Solving', 'FAQ Creation', 'Support Tickets'],
    personality: 'Patient, empathetic, and solution-focused',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Content Creator',
    specialty: 'Blog Writing & SEO',
    description: 'Creates high-quality blog posts, articles, and SEO-optimized content to drive organic traffic.',
    avatar: '👩‍🎨',
    skills: ['Blog Writing', 'SEO', 'Research', 'Editing'],
    personality: 'Creative wordsmith with SEO expertise',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Business Strategist',
    specialty: 'Strategy & Planning',
    description: 'Helps develop business strategies, analyze market trends, and create actionable growth plans.',
    avatar: '👨‍💼',
    skills: ['Strategic Planning', 'Market Analysis', 'Goal Setting', 'KPIs'],
    personality: 'Analytical and forward-thinking',
  },
];

const BRAND_TONES = [
  'Professional',
  'Casual',
  'Friendly',
  'Authoritative',
  'Playful',
  'Inspiring',
];

const INDUSTRIES = [
  'E-commerce',
  'SaaS',
  'Consulting',
  'Healthcare',
  'Education',
  'Real Estate',
  'Finance',
  'Food & Beverage',
  'Fashion',
  'Technology',
  'Other',
];

const GOALS = [
  'Increase Sales',
  'Build Brand Awareness',
  'Grow Social Following',
  'Generate Leads',
  'Customer Engagement',
  'Content Creation',
];

export const CreateAgentScreen: React.FC<CreateAgentScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { addAgent } = useAgentStore();
  const { showToast } = useToastStore();
  const { createBusiness, createAgent } = useApi();
  const [isCreating, setIsCreating] = useState(false);

  const [step, setStep] = useState(1); // 1: Select Agent, 2: Business Info, 3: Goals & Tone
  const [selectedAgent, setSelectedAgent] = useState<typeof AI_AGENTS[0] | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    description: '',
    targetAudience: '',
    brandTone: '',
    goals: [] as string[],
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleCreateAgent = async () => {
    if (!selectedAgent) {
      showToast('Please select an AI agent', 'error');
      return;
    }

    if (!formData.businessName || !formData.industry) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsCreating(true);

      // Create business
      const business = await createBusiness({
        name: formData.businessName,
        industry: formData.industry,
        description: formData.description,
        targetAudience: formData.targetAudience,
        brandTone: formData.brandTone || 'Professional',
        goals: formData.goals,
      });

      // Create agent with selected persona
      const agent = await createAgent({
        businessId: business.id,
        agentName: selectedAgent.name,
        role: selectedAgent.role,
        memory: `You are ${selectedAgent.name}, a ${selectedAgent.role}. ${selectedAgent.description} 
        
Your personality: ${selectedAgent.personality}

Your core skills:
${selectedAgent.skills.map(skill => `- ${skill}`).join('\n')}

You work for ${formData.businessName} in the ${formData.industry} industry.
${formData.description ? `Business description: ${formData.description}` : ''}
${formData.targetAudience ? `Target audience: ${formData.targetAudience}` : ''}

You always communicate in a ${formData.brandTone || 'professional'} tone and focus on helping achieve these goals:
${formData.goals.map(goal => `- ${goal}`).join('\n')}

Be proactive, helpful, and always stay in character as ${selectedAgent.name}.`,
      });

      addAgent({
        id: agent.id,
        agentName: selectedAgent.name,
        businessName: formData.businessName,
        industry: formData.industry,
        description: formData.description,
        targetAudience: formData.targetAudience,
        brandTone: formData.brandTone || 'Professional',
        socialLinks: {},
        logo: '',
        brandColors: { primary: '#6366F1', secondary: '#8B5CF6' },
        goals: formData.goals,
        role: selectedAgent.role,
        createdAt: new Date(),
      });

      showToast(`${selectedAgent.name} has been hired!`, 'success');
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to create agent:', error);
      showToast(error.message || 'Failed to hire agent', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const renderAgentSelection = () => (
    <View style={{ flex: 1 }}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Choose Your AI Employee
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Select the perfect AI agent for your business needs
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.agentList}>
        {AI_AGENTS.map((agent) => (
          <TouchableOpacity
            key={agent.id}
            onPress={() => setSelectedAgent(agent)}
            activeOpacity={0.7}
          >
            <Card
              style={[
                styles.agentCard,
                selectedAgent?.id === agent.id && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.agentHeader}>
                <Text style={styles.agentAvatar}>{agent.avatar}</Text>
                <View style={styles.agentInfo}>
                  <Text style={[styles.agentName, { color: colors.text }]}>
                    {agent.name}
                  </Text>
                  <Text style={[styles.agentRole, { color: colors.primary }]}>
                    {agent.role}
                  </Text>
                </View>
                {selectedAgent?.id === agent.id && (
                  <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                )}
              </View>

              <Text style={[styles.agentSpecialty, { color: colors.textSecondary }]}>
                {agent.specialty}
              </Text>
              <Text style={[styles.agentDescription, { color: colors.text }]}>
                {agent.description}
              </Text>

              <View style={styles.skillsContainer}>
                {agent.skills.map((skill, index) => (
                  <View
                    key={index}
                    style={[styles.skillBadge, { backgroundColor: colors.primary + '20' }]}
                  >
                    <Text style={[styles.skillText, { color: colors.primary }]}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.agentPersonality, { color: colors.textSecondary }]}>
                💡 {agent.personality}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Button
        title="Continue"
        onPress={() => setStep(2)}
        disabled={!selectedAgent}
        style={styles.continueButton}
      />
    </View>
  );

  const renderBusinessInfo = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Tell {selectedAgent?.name} About Your Business
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          This helps {selectedAgent?.name} understand your brand better
        </Text>

        <Card style={styles.formCard}>
          <Text style={[styles.label, { color: colors.text }]}>
            Business Name <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            placeholder="e.g., Acme Corp"
            placeholderTextColor={colors.textSecondary}
            value={formData.businessName}
            onChangeText={(value) => updateFormData('businessName', value)}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Industry <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {INDUSTRIES.map((industry) => (
              <TouchableOpacity
                key={industry}
                onPress={() => updateFormData('industry', industry)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      formData.industry === industry
                        ? colors.primary
                        : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        formData.industry === industry
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {industry}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: colors.text }]}>
            Business Description
          </Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, backgroundColor: colors.surface }]}
            placeholder="What does your business do?"
            placeholderTextColor={colors.textSecondary}
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Target Audience
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            placeholder="Who are your customers?"
            placeholderTextColor={colors.textSecondary}
            value={formData.targetAudience}
            onChangeText={(value) => updateFormData('targetAudience', value)}
          />
        </Card>

        <View style={styles.navigationButtons}>
          <Button
            title="Back"
            onPress={() => setStep(1)}
            variant="secondary"
            style={{ flex: 1, marginRight: Spacing.sm }}
          />
          <Button
            title="Continue"
            onPress={() => setStep(3)}
            disabled={!formData.businessName || !formData.industry}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderGoalsAndTone = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Set Your Goals & Brand Voice
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {selectedAgent?.name} will help you achieve these goals
        </Text>

        <Card style={styles.formCard}>
          <Text style={[styles.label, { color: colors.text }]}>
            What are your main goals?
          </Text>
          <View style={styles.goalsContainer}>
            {GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                onPress={() => toggleGoal(goal)}
                style={[
                  styles.goalChip,
                  {
                    backgroundColor: formData.goals.includes(goal)
                      ? colors.primary
                      : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.goalText,
                    {
                      color: formData.goals.includes(goal)
                        ? '#FFFFFF'
                        : colors.text,
                    },
                  ]}
                >
                  {goal}
                </Text>
                {formData.goals.includes(goal) && (
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: Spacing.lg }]}>
            Brand Tone
          </Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            How should {selectedAgent?.name} communicate?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {BRAND_TONES.map((tone) => (
              <TouchableOpacity
                key={tone}
                onPress={() => updateFormData('brandTone', tone)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      formData.brandTone === tone
                        ? colors.primary
                        : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        formData.brandTone === tone
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {tone}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        <View style={styles.navigationButtons}>
          <Button
            title="Back"
            onPress={() => setStep(2)}
            variant="secondary"
            style={{ flex: 1, marginRight: Spacing.sm }}
          />
          <Button
            title={isCreating ? 'Hiring...' : `Hire ${selectedAgent?.name}`}
            onPress={handleCreateAgent}
            disabled={isCreating || formData.goals.length === 0}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {step === 1 ? 'Hire AI Employee' : step === 2 ? 'Business Info' : 'Final Steps'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              {
                backgroundColor: s <= step ? colors.primary : colors.surface,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {step === 1 && renderAgentSelection()}
        {step === 2 && renderBusinessInfo()}
        {step === 3 && renderGoalsAndTone()}
      </View>
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
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: FontSize.base,
    marginBottom: Spacing.lg,
  },
  agentList: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  agentCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  agentAvatar: {
    fontSize: 48,
    marginRight: Spacing.md,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  agentRole: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  agentSpecialty: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  agentDescription: {
    fontSize: FontSize.base,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  skillBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  skillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  agentPersonality: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  continueButton: {
    marginBottom: Spacing.xl,
  },
  keyboardView: {
    flex: 1,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  helperText: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  input: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
  },
  textArea: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    marginVertical: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  goalText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  navigationButtons: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
});
