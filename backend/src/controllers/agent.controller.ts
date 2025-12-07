import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AgentService } from '../services/agent.service';

export class AgentController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await AgentService.createAgent({
        ...req.body,
        userId: req.userId!,
      });
      res.status(201).json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await AgentService.getAgentById(req.params.id, req.userId!);
      res.status(200).json(agent);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async getByBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agents = await AgentService.getAgentsByBusiness(
        req.params.businessId,
        req.userId!
      );
      res.status(200).json(agents);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await AgentService.deleteAgent(req.params.id, req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateMemory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const agent = await AgentService.updateAgentMemory(
        req.params.id,
        req.userId!
      );
      res.status(200).json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
