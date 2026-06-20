// services/category.service.ts
import { categoryRepository } from '../repositories/category.repository';

export class CategoryService {
  async getAll(userId: string) {
    return categoryRepository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const category = await categoryRepository.findById(id, userId);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async create(userId: string, data: any) {
    return categoryRepository.create(userId, data);
  }

  async update(id: string, userId: string, data: any, isAdmin = false) {
    const category = await this.getById(id, userId);
    if (category.isSystem && !isAdmin) {
      throw new Error('System default categories cannot be modified');
    }
    return categoryRepository.update(id, userId, data);
  }

  async delete(id: string, userId: string, isAdmin = false) {
    const category = await this.getById(id, userId);
    if (category.isSystem && !isAdmin) {
      throw new Error('System default categories cannot be deleted');
    }
    return categoryRepository.delete(id, userId);
  }
}
export const categoryService = new CategoryService();
