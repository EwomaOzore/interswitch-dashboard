import { useState, useEffect, useCallback, useRef } from "react";

interface SessionTimeoutConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  onTimeout: () => void;
  onWarning: () => void;
}

export function useSessionTimeout({
  timeoutMinutes = 5,
  warningMinutes = 1,
  onTimeout,
  onWarning,
}: SessionTimeoutConfig) {
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setTimeLeft(timeoutMinutes * 60);
    setIsWarning(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    timeoutRef.current = setTimeout(
      () => {
        setIsActive(false);
        onTimeout();
      },
      timeoutMinutes * 60 * 1000,
    );

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutMinutes * 60 - elapsed);

      setTimeLeft(remaining);

      if (remaining <= warningMinutes * 60 && !isWarning) {
        setIsWarning(true);
        onWarning();
      }

      if (remaining <= 0) {
        setIsActive(false);
        onTimeout();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 1000);
  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning, isWarning]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    resetTimer();
  }, [resetTimer]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      if (isActive) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isActive, resetTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  return {
    timeLeft,
    isWarning,
    isActive,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
