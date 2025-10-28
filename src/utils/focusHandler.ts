/**
 * 仅对输入框（input, textarea）触发的 focusin/focusout 事件处理器
 * 用于避免多选框、按钮等元素触发全局焦点逻辑
 */
export function setupFocusHandlers(
  onGlobalFocus: (event: FocusEvent) => void,
  onGlobalBlur: (event: FocusEvent) => void
) {
  // 辅助函数：判断是否为输入框
  function isInputElement(el: EventTarget | null): boolean {
    if (!el || !(el instanceof Element)) return false;

    // 仅允许 textarea、contenteditable 元素
    return ['TEXTAREA'].includes(el.tagName)
  }

  // 事件处理：仅输入框触发
  const handleFocusIn = (e: FocusEvent) => {
    if (isInputElement(e.target)) {
      onGlobalFocus(e);
    }
  };

  const handleFocusOut = (e: FocusEvent) => {
    if (isInputElement(e.target)) {
      onGlobalBlur(e);
    }
  };

  // 绑定全局事件
  window.addEventListener('focusin', handleFocusIn);
  window.addEventListener('focusout', handleFocusOut);

  // 返回清理函数，便于后续移除监听
  return () => {
    window.removeEventListener('focusin', handleFocusIn);
    window.removeEventListener('focusout', handleFocusOut);
  };
}