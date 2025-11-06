/**
 * 检测当前环境是否为PWA
 * @returns {boolean} 是否为PWA环境
 */
export function isPWA(): boolean {
  // 检测是否在standalone模式下运行（PWA安装后）
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  // 检测是否在iOS Safari的standalone模式下
  if ((window.navigator as any).standalone === true) {
    return true
  }

  // 检测是否通过service worker运行
  if ('serviceWorker' in navigator) {
    // 可以通过检查是否在独立窗口中运行
    // 或者检查referrer是否为空（从主屏幕启动）
    if (document.referrer.includes('android-app://')) {
      return true
    }
  }

  return false
}
