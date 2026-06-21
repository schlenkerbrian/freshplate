import { useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setValue(value) {
    try {
      const next = value instanceof Function ? value(stored) : value;
      setStored(next);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // localStorage full or unavailable — still update in-memory state
      setStored(value instanceof Function ? value(stored) : value);
    }
  }

  return [stored, setValue];
}
