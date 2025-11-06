import { computed, ref, watch } from 'vue'
import { isPWA } from '@/utils/pwa'

const PWA_ENABLED_KEY = 'pwaExperienceEnabled'

// 全局状态
const isPWAEnvironment = ref(isPWA())

// 初始化PWA体验启用状态
function initPWAExperienceEnabled(): boolean {
  // 如果是PWA环境，默认启用；否则从localStorage读取
  if (isPWAEnvironment.value) {
    const stored = localStorage.getItem(PWA_ENABLED_KEY)
    if (stored === null) {
      // 首次在PWA环境下，默认启用
      return true
    }
    return stored === 'true'
  }
  return false
}

const pwaExperienceEnabled = ref<boolean>(initPWAExperienceEnabled())

// 监听变化并保存到localStorage
watch(pwaExperienceEnabled, (newValue) => {
  if (isPWAEnvironment.value) {
    localStorage.setItem(PWA_ENABLED_KEY, String(newValue))
  }
}, { immediate: true })

/**
 * PWA状态管理composable
 */
export function usePWA() {
  return {
    // 是否为PWA环境
    isPWAEnvironment: computed(() => isPWAEnvironment.value),
    // PWA体验是否启用
    pwaExperienceEnabled: computed({
      get: () => pwaExperienceEnabled.value,
      set: (value: boolean) => {
        pwaExperienceEnabled.value = value
      },
    }),
    // 是否应该应用PWA样式（仅在PWA环境且启用时）
    shouldApplyPWAStyle: computed(() => isPWAEnvironment.value && pwaExperienceEnabled.value),
  }
}

