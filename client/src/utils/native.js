import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Check if the app is currently running inside Capacitor iOS or Android
 */
export const isNativePlatform = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch (e) {
    return false;
  }
};

/**
 * Trigger subtle haptic feedback for button taps
 */
export const triggerHaptic = async (style = ImpactStyle.Light) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  } catch (e) {
    // Ignore in unsupported environments
  }
};

/**
 * Trigger success haptic notification
 */
export const triggerSuccessHaptic = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  } catch (e) {
    // Ignore in unsupported environments
  }
};

/**
 * Trigger error / warning haptic notification
 */
export const triggerErrorHaptic = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  } catch (e) {
    // Ignore in unsupported environments
  }
};

/**
 * Initialize native status bar and splash screen on startup
 */
export const initNativeApp = async () => {
  if (!isNativePlatform()) return;

  try {
    // Dark status bar with light text to match gaming theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#080a0f' });
  } catch (e) {
    console.debug('StatusBar initialization skipped:', e);
  }

  try {
    // Hide splash screen smoothly after app is mounted
    setTimeout(async () => {
      await SplashScreen.hide({ fadeOutDuration: 400 });
    }, 500);
  } catch (e) {
    console.debug('SplashScreen hide skipped:', e);
  }
};
