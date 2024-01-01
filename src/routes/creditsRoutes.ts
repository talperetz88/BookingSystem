import express from 'express';
import { getCreditsStats } from '../controllers/creditsController';

const router = express.Router();

router.get('/getCredits/stats', getCreditsStats);

export default router;
