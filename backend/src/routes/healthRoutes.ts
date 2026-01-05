// src/routes/healthRoutes.ts
// Health check routes for the AIDO task management application

import express from 'express';
import { healthCheck } from '../controllers/healthController';

const router = express.Router();

// Health check route (no authentication required)
router.get('/', healthCheck);

export const healthRoutes = router;