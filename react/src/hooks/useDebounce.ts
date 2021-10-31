import { useState, useEffect } from 'react';

export default function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      /**
       * return a cleanup function that will be called every time
       * useEffect is re-called. useEffect will only be re-called if value changes 
       * This is how we prevent debouncedValue from changing if value is
       * changed within the delay period. Timeout gets cleared and restarted.
       */
      return (): void => {
        clearTimeout(handler);
      };
    },
    // only re-call effect if value changes
    [value] 
  );
  return debouncedValue;
}