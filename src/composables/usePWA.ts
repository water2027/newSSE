import { computed, ref, watch } from 'vue'
import { isPWA } from '@/utils/pwa'

const PWA_ENABLED_KEY = 'pwaExperienceEnabled'

const isPWAEnvironment = ref(isPWA())

function initPWAExperienceEnabled(): boolean {
  const stored = localStorage.getItem(PWA_ENABLED_KEY)
  if (stored !== null)
    return stored === 'true'

  // 默认启用新体验
  return true
}

const pwaExperienceEnabled = ref<boolean>(initPWAExperienceEnabled())

// 监听变化并保存到 localStorage（所有环境都持久化，方便用户在浏览器中也记住选择）
watch(pwaExperienceEnabled, (newValue) => {
  localStorage.setItem(PWA_ENABLED_KEY, String(newValue))
}, { immediate: true })

/**
 * PWA状态管理composable
 */
export function usePWA() {
  return {
    // 是否为PWA环境
    isPWAEnvironment: computed(() => isPWAEnvironment.value),
    // 电脑端样式新体验是否启用
    pwaExperienceEnabled: computed({
      get: () => pwaExperienceEnabled.value,
      set: (value: boolean) => {
        pwaExperienceEnabled.value = value
      },
    }),
    shouldApplyPWAStyle: computed(() => isPWAEnvironment.value && pwaExperienceEnabled.value),
    desktopExperienceEnabled: computed(() => pwaExperienceEnabled.value),
  }
}
