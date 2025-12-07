import { Router } from 'express';
import { body } from 'express-validator';
import { ContentController } from '../controllers/content.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Content generation validation
const generateValidation = [
  body('type')
    .isIn(['post', 'caption', 'ad', 'blog', 'email'])
    .withMessage('Valid content type is required'),
  body('prompt').trim().notEmpty().withMessage('Prompt is required'),
];

// Routes
router.post('/:id/content/create', validate(generateValidation), ContentController.generate);
router.get('/:id/content/all', ContentController.getAll);

export default router;
