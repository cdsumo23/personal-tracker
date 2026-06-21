// hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { pushApi } from '../lib/api';
import toast from 'react-hot-toast';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const getRegistration = useCallback(async (): Promise<ServiceWorkerRegistration> => {
    // 1. Try to get existing registration
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations && registrations.length > 0) {
      const activeReg = registrations.find(r => r.active) || registrations[0];
      return activeReg;
    }

    // 2. If no active registration, try to manually register
    console.log('No service worker registered. Registering sw.js manually...');
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered manually:', reg);
      return reg;
    } catch (err) {
      console.error('Manual service worker registration failed:', err);
    }

    // 3. Fallback to ready
    return await navigator.serviceWorker.ready;
  }, []);

  const checkSubscription = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
      return;
    }

    try {
      setPermission(Notification.permission);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
      );

      const registration = await Promise.race([
        getRegistration(),
        timeoutPromise,
      ]);
      
      const sub = await registration.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error('Error checking service worker push subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getRegistration]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported on this browser/device.');
      return;
    }

    setIsActionLoading(true);
    try {
      // 1. Request user permission
      const userPermission = await Notification.requestPermission();
      setPermission(userPermission);

      if (userPermission !== 'granted') {
        toast.error('Notification permission was denied.');
        setIsActionLoading(false);
        return;
      }

      // 2. Fetch VAPID public key from backend
      const res = await pushApi.getPublicKey();
      const { publicKey } = res.data.data;

      // 3. Register push manager on browser
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
      );

      const registration = await Promise.race([
        getRegistration(),
        timeoutPromise,
      ]);

      const convertedKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      // 4. Send subscription details to backend
      const rawSub = subscription.toJSON();
      
      // Safety checks on keys
      if (!rawSub.endpoint || !rawSub.keys || !rawSub.keys.auth || !rawSub.keys.p256dh) {
        throw new Error('Push subscription failed: Browser returned incomplete subscription payload.');
      }

      await pushApi.subscribe({
        endpoint: rawSub.endpoint,
        keys: {
          auth: rawSub.keys.auth,
          p256dh: rawSub.keys.p256dh,
        },
      });

      setIsSubscribed(true);
      toast.success('Successfully subscribed to push notifications!');
    } catch (error: any) {
      console.error('Push subscription error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to subscribe to push notifications.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;

    setIsActionLoading(true);
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
      );

      const registration = await Promise.race([
        getRegistration(),
        timeoutPromise,
      ]);

      const sub = await registration.pushManager.getSubscription();

      if (sub) {
        // 1. Notify backend to delete subscription
        await pushApi.unsubscribe(sub.endpoint);
        // 2. Unsubscribe browser-level push manager
        await sub.unsubscribe();
      }

      setIsSubscribed(false);
      toast.success('Successfully unsubscribed from push notifications.');
    } catch (error: any) {
      console.error('Push unsubscription error:', error);
      toast.error('Failed to unsubscribe from push notifications.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!isSubscribed) {
      toast.error('Subscribe to push notifications before testing.');
      return;
    }

    try {
      await pushApi.testPush();
      toast.success('Test notification requested.');
    } catch (error: any) {
      toast.error('Failed to trigger test notification.');
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    isActionLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
    refreshState: checkSubscription,
  };
}
