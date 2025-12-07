import prisma from '../config/database';
import { AIMemoryService } from './ai-memory.service';

export interface CreateAgentInput {
  businessId: string;
  agentName: string;
  userId: string; // For verification
}

export class AgentService {
  static async createAgent(input: CreateAgentInput) {
    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: input.businessId, userId: input.userId },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    // Create memory profile from business data
    const memoryProfile = AIMemoryService.generateMemoryProfile(business);

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        businessId: input.businessId,
        agentName: input.agentName,
        memory: memoryProfile,
      },
    });

    // Generate and store embeddings for the memory
    await AIMemoryService.storeMemoryEmbedding(agent.id, memoryProfile, {
      type: 'business_profile',
      businessId: input.businessId,
    });

    return agent;
  }

  static async getAgentById(agentId: string, userId: string) {
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
      include: {
        business: true,
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    return agent;
  }

  static async getAgentsByBusiness(businessId: string, userId: string) {
    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    const agents = await prisma.agent.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return agents;
  }

  static async deleteAgent(agentId: string, userId: string) {
    // Verify ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    await prisma.agent.delete({
      where: { id: agentId },
    });

    return { message: 'Agent deleted successfully' };
  }

  static async updateAgentMemory(agentId: string, userId: string) {
    // Verify ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
      include: { business: true },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Regenerate memory from updated business data
    const memoryProfile = AIMemoryService.generateMemoryProfile(agent.business);

    // Update agent memory
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: { memory: memoryProfile },
    });

    // Update embeddings
    await AIMemoryService.storeMemoryEmbedding(agentId, memoryProfile, {
      type: 'business_profile',
      businessId: agent.businessId,
    });

    return updatedAgent;
  }
}
