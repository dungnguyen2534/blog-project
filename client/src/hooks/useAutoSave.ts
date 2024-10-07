import { useCallback, useEffect, useState } from "react";

export default function useAutoSave<T>(key: string, value: T, interval = 2500) {
  const stringifiedValue = JSON.stringify(value);

  const [autoSave, setAutoSave] = useState(false);
  const [lastSavedValue, setLastSavedValue] = useState(() => {
    if (typeof window !== "undefined") return null;
    return localStorage.getItem(key);
  });

  useEffect(() => {
    const i = setInterval(() => {
      setAutoSave(true);
    }, interval);

    return () => {
      setAutoSave(false);
      clearInterval(i);
    };
  }, [interval]);

  useEffect(() => {
    if (autoSave && stringifiedValue !== lastSavedValue) {
      localStorage.setItem(key, stringifiedValue);
      setAutoSave(false);
      setLastSavedValue(stringifiedValue);
    }
  }, [autoSave, key, lastSavedValue, stringifiedValue]);

  const getAutoSavedValue = useCallback((): T | null => {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : null;
  }, [key]);

  const clearAutoSavedValue = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { getAutoSavedValue, clearAutoSavedValue };
}
