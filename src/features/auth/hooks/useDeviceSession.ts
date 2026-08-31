import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

/**
 * localStorage key for the persistent device identifier.
 *
 * This UUID identifies the physical device/browser, NOT a session.
 * It survives tab close, browser restart, and page refresh.
 * It only changes when the user explicitly clears site data.
 */
const DEVICE_ID_KEY = 'splitpay_device_id';

const VALIDATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create the persistent device identifier.
 *
 * Stored in localStorage so it persists across:
 * - tab close / reopen
 * - browser restart
 * - normal page refresh
 *
 * Only cleared when user explicitly clears site data.
 */
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Hook to manage single active device session.
 *
 * ONE ACCOUNT = ONE ACTIVE DEVICE.
 *
 * Uses a persistent device ID (localStorage) rather than a per-tab session ID.
 * This ensures a legitimate returning user on the same device is never
 * rejected, while a different device is correctly detected and rejected.
 *
 * Flow:
 * 1. On mount: validate this device's ID against the stored active_session_id.
 * 2. If valid (or first time): register this device as active.
 * 3. If invalid: another device has taken over → sign out.
 * 4. Periodically re-validate to catch mid-session takeovers.
 * 5. On tab visibility change (user returns): re-validate immediately.
 */
export function useDeviceSession() {
  const { user } = useAuth();
  const deviceIdRef = useRef<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const validatingRef = useRef<boolean>(false);  const validateAndRegister = useCallback(async () => {
    if (!user) return;

    // Prevent concurrent validation calls from racing each other.
    // onAuthStateChange can fire multiple times during Supabase
    // initialization (INITIAL_SESSION, TOKEN_REFRESHED), each triggering
    // a new validateAndRegister. Without this guard, two in-flight RPC
    // sequences can race and produce unpredictable results.
    if (validatingRef.current) {
      console.log('[DeviceSession] Skipping — validation already in progress');
      return;
    }
    validatingRef.current = true;

    try {
      const deviceId = getOrCreateDeviceId();
      deviceIdRef.current = deviceId;

      console.log('[DeviceSession] Validating:', {
        userId: user.id,
        deviceId,
        pathname: window.location.pathname,
      });

      // Check if this device is still the active one
      const { data: isValid, error: checkError } = await supabase.rpc(
        'is_session_valid',
        {
          p_user_id: user.id,
          p_session_id: deviceId,
        },
      );

      console.log('[DeviceSession] is_session_valid result:', {
        isValid,
        checkError: checkError?.message,
        checkErrorCode: checkError?.code,
      });

      if (checkError) {
        console.warn('[DeviceSession] Validation RPC error:', checkError.message);
        return; // Don't sign out on network/function errors
      }

      if (!isValid) {
        // Another device has taken over this account
        console.warn(
          '[DeviceSession] Session invalidated — signing out. userId:',
          user.id,
          'deviceId:',
          deviceId,
        );
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }

      // Device is valid — register/confirm it as active
      const { data: result, error: setActiveError } = await supabase.rpc(
        'set_active_session',
        {
          p_user_id: user.id,
          p_session_id: deviceId,
        },
      );

      console.log('[DeviceSession] set_active_session result:', {
        result,
        setActiveError: setActiveError?.message,
      });

      if (setActiveError) {
        console.warn(
          '[DeviceSession] set_active_session error:', setActiveError.message,
        );
        // Don't sign out — the device was already validated as current
        return;
      }

      if (result === 'takeover') {
        console.info(
          '[DeviceSession] Session takeover: this device is now the active session',
        );
      }
    } finally {
      validatingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Initial validation
    validateAndRegister();

    // Periodic validation
    intervalRef.current = setInterval(validateAndRegister, VALIDATION_INTERVAL_MS);

    // Re-validate on tab visibility change (user returns to app)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        validateAndRegister();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, validateAndRegister]);

  return deviceIdRef.current;
}
