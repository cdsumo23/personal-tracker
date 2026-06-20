// routes/category.routes.ts
import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { CategorySchema } from '@budget/shared';

const router = Router();

router.use(authenticate);

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', validate(CategorySchema), createCategory);
router.put('/:id', validate(CategorySchema.partial()), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
