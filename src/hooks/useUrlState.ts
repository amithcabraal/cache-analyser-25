import { useState, useEffect } from 'react';
import queryString from 'query-string';

export function useUrlState<T extends Record<string, any>>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const params = queryString.parse(window.location.search);
    const savedValue = params[key];
    if (savedValue) {
      try {
        return JSON.parse(savedValue as string) as T;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    const params = queryString.parse(window.location.search);
    if (!state || Object.keys(state).length === 0) {
      delete params[key];
    } else {
      params[key] = JSON.stringify(state);
    }
    const newSearch = queryString.stringify(params);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`
    );
  }, [state, key]);

  return [state, setState];
}
