import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Credit } from '../models/creditModel';
import {sequelize} from '../models/sequelize';
import { CreditService } from '../services/creditsService';
const creditsService = new CreditService(sequelize)

export const getCreditsStats = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

  try {
    const [credits,stats] = await creditsService.getCredit(patientId);

    res.status(200).json({ credits, stats });
  } catch (error) {
    console.error('Error retrieving monthly credits used statistics:', error);
    res.status(500).json({ error: 'An error occurred while retrieving monthly credits used statistics.' });
  }
});
