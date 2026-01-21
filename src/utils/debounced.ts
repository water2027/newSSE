import { showMsg } from "@/components/MessageBox";
const MIN_CLICK_GAP = 6000

// 防抖函数（第一次点击有效）
export function debounce<T extends (...args: any[]) => void>(
  fn: T
): (...args: Parameters<T>) => void {
  let lastClickTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastClickTime >= MIN_CLICK_GAP) {
      lastClickTime = now;
      fn(...args);
    }
  };
}

// 异步防抖函数（第一次点击有效）
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastClickTime = 0;

  return async (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastClickTime < MIN_CLICK_GAP) {
      showMsg("操作太频繁，请稍后再试");
      throw new Error("操作太频繁，请稍后再试");
    }
    lastClickTime = now;
    return await fn(...args);
  };
}
