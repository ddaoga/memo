import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** 서버 렌더와 첫 하이드레이션에서는 false, 그 뒤로는 true */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
