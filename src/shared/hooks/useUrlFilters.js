import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Filter state lives in the URL (?q=&language=&level=), so a filtered view can be
 * bookmarked, shared with a student, and survives refresh.
 */
export function useUrlFilters(keys) {
  const [params, setParams] = useSearchParams();
  const values = useMemo(() => Object.fromEntries(keys.map((k) => [k, params.get(k) || ''])), [params, keys]);
  const set = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value); else next.delete(key);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );
  const clear = useCallback(() => {
    const next = new URLSearchParams(params);
    keys.forEach((k) => next.delete(k));
    setParams(next, { replace: true });
  }, [params, setParams, keys]);
  const active = keys.some((k) => values[k]);
  return { values, set, clear, active };
}
