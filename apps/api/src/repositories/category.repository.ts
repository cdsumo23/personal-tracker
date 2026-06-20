// repositories/category.repository.ts
import prisma from '../config/database';
import { Category, CategoryType } from '@prisma/client';

export class CategoryRepository {
  async findAll(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        OR: [
          { userId, deletedAt: null },
          { isSystem: true, deletedAt: null }
        ]
      },
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { userId },
          { isSystem: true }
        ]
      }
    });
  }

  async create(
    userId: string,
    data: {
      name: string;
      type: CategoryType;
      icon?: string | null;
      color?: string | null;
    }
  ): Promise<Category> {
    return prisma.category.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        isSystem: false
      }
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Category, 'id' | 'userId' | 'isSystem' | 'createdAt' | 'updatedAt'>>
  ): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data
    });
  }

  async delete(id: string, userId: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
export const categoryRepository = new CategoryRepository();
