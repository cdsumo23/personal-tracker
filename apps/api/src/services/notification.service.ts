// services/notification.service.ts
import { notificationRepository } from '../repositories/notification.repository';

export class NotificationService {
  async getAll(userId: string) {
    return notificationRepository.findAll(userId);
  }

  async create(userId: string, data: any) {
    return notificationRepository.create(userId, data);
  }

  async markRead(id: string, userId: string) {
    const notif = await notificationRepository.findById(id, userId);
    if (!notif) throw new Error('Notification not found');
    return notificationRepository.markRead(id);
  }

  async markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  }

  async delete(id: string, userId: string) {
    const notif = await notificationRepository.findById(id, userId);
    if (!notif) throw new Error('Notification not found');
    return notificationRepository.delete(id);
  }
}
export const notificationService = new NotificationService();
