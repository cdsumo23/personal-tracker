// services/push.service.ts
import webpush from 'web-push';
import { config } from '../config/env';
import prisma from '../config/database';
import logger from '../config/logger';

// Initialize web-push with VAPID keys
if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (config.EMAIL_FROM || 'noreply@budgetplanner.com'),
    config.VAPID_PUBLIC_KEY,
    config.VAPID_PRIVATE_KEY
  );
  logger.info('Web Push VAPID keys successfully configured.');
} else {
  logger.warn('Web Push VAPID keys are not configured. Push notifications will be disabled.');
}

export class PushService {
  /**
   * Send a push notification to all active device subscriptions of a user.
   * Cleans up any dead/expired subscriptions automatically.
   */
  async sendNotificationToUser(
    userId: string,
    payload: { title: string; body: string; url?: string }
  ): Promise<void> {
    if (!config.VAPID_PUBLIC_KEY || !config.VAPID_PRIVATE_KEY) {
      logger.warn(`Skipped sending push to user ${userId} - VAPID keys not configured.`);
      return;
    }

    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      if (subscriptions.length === 0) {
        return; // No registered subscriptions for this user
      }

      logger.info(`Sending push notifications to ${subscriptions.length} device(s) for user ${userId}`);

      const stringifiedPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/notifications',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png'
      });

      const promises = subscriptions.map(async (sub) => {
        const pushSubscriptionObject = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webpush.sendNotification(pushSubscriptionObject, stringifiedPayload);
        } catch (error: any) {
          // 410 Gone or 404 Not Found means the subscription is no longer valid/expired
          if (error.statusCode === 410 || error.statusCode === 404) {
            logger.info(`Removing expired or invalid push subscription: ${sub.id}`);
            await prisma.pushSubscription.delete({
              where: { id: sub.id }
            });
          } else {
            logger.error(`Error sending push notification to subscription ${sub.id}:`, error.message);
          }
        }
      });

      await Promise.all(promises);
    } catch (error: any) {
      logger.error(`Failed to send push notifications to user ${userId}:`, error.message);
    }
  }

  /**
   * Register a new device push subscription for a user.
   */
  async subscribe(
    userId: string,
    subscriptionData: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    }
  ) {
    const { endpoint, keys } = subscriptionData;

    // Check if subscription already exists for this endpoint
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    });

    if (existing) {
      // If user changed, update userId. Otherwise, return existing
      if (existing.userId !== userId) {
        return prisma.pushSubscription.update({
          where: { endpoint },
          data: { userId, p256dh: keys.p256dh, auth: keys.auth }
        });
      }
      return existing;
    }

    return prisma.pushSubscription.create({
      data: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    });
  }

  /**
   * Unsubscribe a device.
   */
  async unsubscribe(endpoint: string): Promise<void> {
    try {
      await prisma.pushSubscription.delete({
        where: { endpoint }
      });
      logger.info(`Unsubscribed endpoint: ${endpoint}`);
    } catch (error: any) {
      // If it doesn't exist, ignore
      logger.debug(`Endpoint to unsubscribe was not found: ${endpoint}`);
    }
  }
}

export const pushService = new PushService();
