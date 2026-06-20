// repositories/notification.repository.ts
import prisma from '../config/database';
import { Notification, NotificationType } from '@prisma/client';

export class NotificationRepository {
  async findAll(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string, userId: string): Promise<Notification | null> {
    return prisma.notification.findFirst({
      where: { id, userId }
    });
  }

  async create(
    userId: string,
    data: {
      title: string;
      message: string;
      type?: NotificationType;
      link?: string | null;
    }
  ): Promise<Notification> {
    const notif = await prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        link: data.link
      }
    });

    // Fire and forget push notification dispatch to avoid blocking db creation
    try {
      const { pushService } = require('../services/push.service');
      pushService.sendNotificationToUser(userId, {
        title: data.title,
        body: data.message,
        url: data.link || undefined
      }).catch((err: any) => {
        // Log push dispatch failures without failing core transaction
        const logger = require('../config/logger').default;
        logger.error(`Failed to send push notification to user ${userId}: ${err.message}`);
      });
    } catch (pushErr: any) {
      const logger = require('../config/logger').default;
      logger.error(`Push service dispatch initiation failed for user ${userId}: ${pushErr.message}`);
    }

    return notif;
  }

  async markRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  async delete(id: string): Promise<Notification> {
    return prisma.notification.delete({
      where: { id }
    });
  }
}
export const notificationRepository = new NotificationRepository();
