import prisma from '../config/database';

interface Business {
  name: string;
  industry?: string | null;
  description?: string | null;
  targetAudience?: string | null;
  brandTone?: string | null;
  socialLinks?: any;
  brandColors?: any;
  goals?: any;
}

// Safely parse JSON strings stored in SQLite
const tryParseJson = (value: any) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }
  return value || null;
};

export class AIMemoryService {
  /**
   * Generate a structured memory profile from business data
   */
  static generateMemoryProfile(business: Business): string {
    const goalsRaw = tryParseJson(business.goals);
    const socialRaw = tryParseJson(business.socialLinks);
    const colorsRaw = tryParseJson(business.brandColors);

    const goals = Array.isArray(goalsRaw) ? goalsRaw : [];
    const socialLinks = socialRaw || {};
    const brandColors = colorsRaw || {};

    return `
BUSINESS IDENTITY:
- Name: ${business.name}
- Industry: ${business.industry || 'Not specified'}
- Description: ${business.description || 'Not specified'}

TARGET AUDIENCE:
${business.targetAudience || 'Not specified'}

BRAND VOICE & TONE:
${business.brandTone || 'professional'}

BRAND COLORS:
${Object.entries(brandColors)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') || 'Not specified'}

SOCIAL MEDIA PRESENCE:
${Object.entries(socialLinks)
  .map(([platform, link]) => `- ${platform}: ${link}`)
  .join('\n') || 'Not specified'}

BUSINESS GOALS:
${goals.map((goal: string) => `- ${goal}`).join('\n') || 'Not specified'}

IMPORTANT INSTRUCTIONS:
- When discussing tasks, action items, or things to do, structure your response to include clear action statements
- Use phrases like "I'll [action]", "I will [action]", or "Task: [action]" to make tasks extractable
- When creating content or making plans, break them down into actionable tasks
- Keep task descriptions concise and specific
`.trim();
  }

  /**
   * Generate embedding for text using OpenAI
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    // DeepSeek-only mode: use lightweight random embedding placeholder.
    return Array(1536)
      .fill(0)
      .map(() => Math.random());
  }

  /**
   * Store memory with embedding in the database
   */
  static async storeMemoryEmbedding(
    agentId: string,
    content: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      const embedding = await this.generateEmbedding(content);
      const embeddingJson = JSON.stringify(embedding);
      const metadataJson = JSON.stringify(metadata);

      // Delete old business profile memories for this agent
      if (metadata.type === 'business_profile') {
        await prisma.agentMemory.deleteMany({
          where: {
            agentId,
            metadata: { contains: '"type":"business_profile"' },
          },
        });
      }

      // Store new memory with embedding as JSON strings (SQLite safe)
      await prisma.agentMemory.create({
        data: {
          agentId,
          content,
          embedding: embeddingJson,
          metadata: metadataJson,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error storing memory embedding:', error);
      throw error;
    }
  }

  /**
   * Search for relevant memories using vector similarity
   */
  static async searchMemories(
    agentId: string,
    query: string,
    limit: number = 5
  ): Promise<Array<{ content: string; metadata: any }>> {
    try {
      // SQLite fallback: return most recent memories (no vector search)
      const memories = await prisma.agentMemory.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return memories.map((m) => ({
        content: m.content,
        metadata: tryParseJson(m.metadata) || {},
      }));
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  /**
   * Get recent conversation history
   */
  static async getRecentMessages(agentId: string, limit: number = 10) {
    const messages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse(); // Oldest to newest
  }

  /**
   * Build complete context for AI prompt
   */
  static async buildAIContext(agentId: string, userMessage: string) {
    // Get agent and business data
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { business: true },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get relevant memories through vector search
    const relevantMemories = await this.searchMemories(agentId, userMessage, 3);

    // Get recent conversation history
    const recentMessages = await this.getRecentMessages(agentId, 10);

    // Build system prompt with all context
    const systemPrompt = `You are ${agent.agentName} for ${agent.business.name}.

${agent.memory}

RELEVANT CONTEXT:
${relevantMemories.map((m) => m.content).join('\n\n')}

You must:
1. Always speak in the brand's tone: ${agent.business.brandTone}
2. Remember and use the business identity in all responses
3. Stay consistent with the brand colors and values
4. Reference the business goals when relevant
5. Maintain conversation continuity
6. When the user asks you to create tasks or mentions tasks, respond with multiple action items
7. ALWAYS format action items as separate sentences starting with "I'll" or "I will"
8. Break down complex requests into 3-5 specific, actionable tasks

CRITICAL TASK FORMATTING RULES:
- When user says "create tasks", "make tasks", "add tasks", or similar, you MUST respond with multiple "I'll" statements
- Each task must be on its own sentence
- Start each task sentence with "I'll" followed by a specific action
- Be concrete and specific about what you will do

Example response formats:
User: "Create tasks for launching a product"
Assistant: "I'll create a product launch timeline. I'll draft social media announcements. I'll prepare email marketing campaigns. I'll design promotional graphics. I'll develop a pricing strategy."

User: "Help me with marketing"
Assistant: "I'll analyze your target audience. I'll create content calendar. I'll design social media posts. I'll write email campaigns."

User: "Make tasks for this week"
Assistant: "I'll review this week's priorities. I'll schedule client meetings. I'll prepare presentation materials. I'll update project documentation."

Respond naturally and helpfully while staying in character as ${agent.agentName}.`;

    return {
      systemPrompt,
      recentMessages,
      agent,
    };
  }
}
