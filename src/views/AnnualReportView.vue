<script setup lang="ts">
import type { AnnualReportData } from '@/api/info/getAnnualReport'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAnnualReport } from '@/api/info/getAnnualReport'
import { levelNameHandler } from '@/utils/level'

const router = useRouter()

const loading = ref(true)
const reportData = ref<AnnualReportData | null>(null)
const currentSlide = ref(0)
const transitionName = ref('slide-up')

// 背景音乐相关
const bgmUrl = 'https://music.163.com/song/media/outer/url?id=2723954830.mp3'
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isFirstInteraction = ref(true)
const autoPlayAttempted = ref(false)

// 检测是否是微信浏览器
function isWechat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

function toggleMusic() {
  if (!audioRef.value)
    return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  }
  else {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(() => {})
  }
}

function playMusic() {
  if (audioRef.value && !isPlaying.value) {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch((e) => {
      console.log('Play music failed:', e)
    })
  }
}

// 尝试自动播放音乐（处理不同浏览器）
function tryAutoPlay() {
  if (autoPlayAttempted.value || !audioRef.value)
    return
  autoPlayAttempted.value = true

  const audio = audioRef.value

  // 方法1: 直接尝试播放
  const playPromise = audio.play()

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying.value = true
        isFirstInteraction.value = false
      })
      .catch(() => {
        // 自动播放被阻止，等待用户交互
        console.log('Auto play blocked, waiting for user interaction')

        // 方法2: 尝试静音播放后恢复音量
        audio.muted = true
        audio.play()
          .then(() => {
            // 静音播放成功，添加交互监听来恢复音量
            const unmute = () => {
              audio.muted = false
              isPlaying.value = true
              isFirstInteraction.value = false
              document.removeEventListener('click', unmute)
              document.removeEventListener('touchstart', unmute)
            }
            document.addEventListener('click', unmute, { once: true })
            document.addEventListener('touchstart', unmute, { once: true })
          })
          .catch(() => {
            // 静音播放也失败，完全依赖用户交互
            console.log('Muted auto play also blocked')
          })
      })
  }
}

// 微信浏览器专用自动播放
function setupWechatAutoPlay() {
  if (!isWechat())
    return

  // 微信 JS-SDK ready 事件
  if (typeof (window as any).WeixinJSBridge !== 'undefined') {
    (window as any).WeixinJSBridge.invoke('getNetworkType', {}, () => {
      tryAutoPlay()
    })
  }
  else {
    document.addEventListener('WeixinJSBridgeReady', () => {
      (window as any).WeixinJSBridge.invoke('getNetworkType', {}, () => {
        tryAutoPlay()
      })
    }, false)
  }
}

// 设置用户交互监听（作为备用方案）
function setupInteractionListener() {
  const handleFirstInteraction = () => {
    if (!isPlaying.value && audioRef.value) {
      playMusic()
    }
    document.removeEventListener('click', handleFirstInteraction)
    document.removeEventListener('touchstart', handleFirstInteraction)
    document.removeEventListener('keydown', handleFirstInteraction)
  }

  // 延迟添加监听，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', handleFirstInteraction, { once: true })
    document.addEventListener('touchstart', handleFirstInteraction, { once: true })
    document.addEventListener('keydown', handleFirstInteraction, { once: true })
  }, 100)
}

// Default avatar fallback
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const daysJoined = computed(() => {
  if (!reportData.value)
    return 0
  // Go time.Duration is int64 nanoseconds
  const durationNs = reportData.value.durationTime
  const ms = durationNs / 1000000
  return Math.floor(ms / (1000 * 60 * 60 * 24))
})

// 动态提示语 - 根据数据生成温馨文案
const durationMessage = computed(() => {
  const days = daysJoined.value
  if (days >= 365)
    return '一整年的陪伴，感谢有你'
  if (days >= 180)
    return '半年时光，见证彼此成长'
  if (days >= 90)
    return '三个月的相遇，故事刚刚开始'
  if (days >= 30)
    return '初来乍到，未来可期'
  return '欢迎新朋友，期待你的精彩'
})

const postingMessage = computed(() => {
  const posts = reportData.value?.thisYearPostCnt || 0
  if (posts >= 100)
    return '高产似那啥！你是集市的创作达人'
  if (posts >= 50)
    return '稳定输出，你的坚持让人敬佩'
  if (posts >= 20)
    return '积少成多，每一篇都是独特的印记'
  if (posts >= 5)
    return '质量优先，你的每次分享都很用心'
  if (posts >= 1)
    return '勇敢迈出第一步，期待更多精彩'
  return '新的一年，期待你的首次发声'
})

const momentMessage = computed(() => {
  const maxLikes = reportData.value?.maxLikeNum || 0
  const maxViews = reportData.value?.maxBrowseNum || 0
  if (maxLikes >= 100 || maxViews >= 1000)
    return '这一刻，你成为了焦点'
  if (maxLikes >= 50 || maxViews >= 500)
    return '你的内容引发了不少共鸣'
  if (maxLikes >= 10 || maxViews >= 100)
    return '有人因你的分享而驻足'
  return '每一次表达都值得被看见'
})

const resonanceMessage = computed(() => {
  const comments = (reportData.value?.pCommentCnt || 0) + (reportData.value?.ccommentCnt || 0)
  const beCommented = reportData.value?.beCommentedCount || 0
  if (comments >= 100 || beCommented >= 50)
    return '你是社区的活跃因子，让讨论更有温度'
  if (comments >= 30 || beCommented >= 20)
    return '你的参与让对话更加丰富多彩'
  if (comments >= 10 || beCommented >= 5)
    return '每一次互动都是一次小小的相遇'
  return '期待你在新的一年里更多参与讨论'
})

const connectionMessage = computed(() => {
  const chatCount = reportData.value?.chatCount || 0
  const hasTopUser = reportData.value?.maxSayUser?.UserID
  if (chatCount >= 500 && hasTopUser)
    return '你们的对话跨越时光，这份默契真珍贵'
  if (chatCount >= 100 && hasTopUser)
    return '有些人，聊着聊着就成了朋友'
  if (chatCount >= 10)
    return '每条消息都是一座小桥，连接着彼此'
  return '新的一年，期待你认识更多有趣的人'
})

const summaryMessage = computed(() => {
  const score = reportData.value?.score || 0
  if (score >= 1000)
    return '你是集市的资深玩家，感谢一路同行'
  if (score >= 500)
    return '稳步成长中，未来会更精彩'
  if (score >= 100)
    return '继续加油，下一个等级在向你招手'
  return '旅程才刚开始，2026 我们一起出发'
})

function handleInteraction() {
  // 第一次点击时尝试播放音乐（如果自动播放失败的话）
  if (isFirstInteraction.value && !isPlaying.value) {
    playMusic()
  }
  isFirstInteraction.value = false
  // Simple click to next
  nextSlide()
}

function nextSlide() {
  if (currentSlide.value < 6) {
    transitionName.value = 'slide-up'
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    transitionName.value = 'slide-down'
    currentSlide.value--
  }
}

function restart() {
  currentSlide.value = 0
}

function goHome() {
  // 离开页面时停止音乐
  if (audioRef.value) {
    audioRef.value.pause()
    isPlaying.value = false
  }
  router.push('/')
}

onUnmounted(() => {
  // 组件卸载时停止音乐
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value = null
  }
})

let touchStartY = 0
let touchEndY = 0

function handleTouchStart(e: TouchEvent) {
  touchStartY = e.changedTouches[0].screenY
}

function handleTouchEnd(e: TouchEvent) {
  touchEndY = e.changedTouches[0].screenY
  handleSwipe()
}

function handleSwipe() {
  if (touchStartY - touchEndY > 50) {
    // Swipe Up -> Next
    nextSlide()
  }
  else if (touchEndY - touchStartY > 50) {
    // Swipe Down -> Prev
    prevSlide()
  }
}

// 计算要显示的其他好友（排除 maxSayUser）
const otherFriends = computed(() => {
  if (!reportData.value?.relevantRespUsers)
    return []
  const maxUserId = reportData.value?.maxSayUser?.UserID
  return reportData.value.relevantRespUsers
    .filter(u => u.UserID !== maxUserId)
    .slice(0, 4)
})

onMounted(async () => {
  try {
    const res = await getAnnualReport()
    if (res && res.code === 200) {
      reportData.value = res.data
    }
    else {
      // Handle error or redirect
      console.error('Failed to load report data')
    }
  }
  catch (e) {
    console.error(e)
  }
  finally {
    loading.value = false
  }

  // 尝试自动播放背景音乐
  // 等待 audio 元素准备好
  setTimeout(() => {
    if (isWechat()) {
      // 微信浏览器使用专用方法
      setupWechatAutoPlay()
    }
    else {
      // 其他浏览器直接尝试自动播放
      tryAutoPlay()
    }
    // 设置用户交互备用监听
    setupInteractionListener()
  }, 500)
})
</script>

<template>
  <div class="report-container">
    <!-- 背景音乐 -->
    <audio ref="audioRef" :src="bgmUrl" loop preload="auto" />

    <!-- 音乐控制按钮 -->
    <div class="music-control" @click.stop="toggleMusic">
      <svg v-if="isPlaying" class="music-icon playing" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18V6M15 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" opacity="0.5" />
      </svg>
      <svg v-else class="music-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 8L16 12L10 16V8Z" fill="currentColor" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" opacity="0.5" />
        <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.7" />
      </svg>
    </div>

    <div class="background-grid" />
    <div class="scan-line" />

    <div v-if="loading" class="loading-screen">
      <div class="tech-spinner">
        <div class="spinner-inner" />
      </div>
      <p class="loading-text">
        SYSTEM INITIALIZING...
      </p>
    </div>

    <div v-else class="slide-container" @click="handleInteraction" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <transition :name="transitionName">
        <!-- Slide 1: Cover -->
        <div v-if="currentSlide === 0" key="0" class="slide slide-cover">
          <div class="content">
            <div class="top-decoration">
              <span class="deco-line" />
              <span class="deco-text">ANNUAL REPORT</span>
              <span class="deco-line" />
            </div>
            <div class="main-title-box">
              <h1 class="glitch-text" data-text="2025">
                2025
              </h1>
              <h2>集市年度报告</h2>
            </div>

            <div class="user-profile">
              <div class="avatar-ring">
                <img :src="reportData?.avatarUrl || defaultAvatar" alt="Avatar" class="avatar">
              </div>
              <p class="greeting">
                {{ reportData?.name }}
              </p>
              <p v-if="reportData?.intro" class="intro-text">
                "{{ reportData?.intro }}"
              </p>
            </div>

            <div class="bottom-hint">
              <p class="hint-text">
                TAP TO ACCESS
              </p>
              <div class="arrow-down" />
            </div>
          </div>
        </div>

        <!-- Slide 2: Duration -->
        <div v-else-if="currentSlide === 1" key="1" class="slide slide-duration">
          <div class="content">
            <h3 class="section-title">
              START
            </h3>
            <p class="desc-text">
              已接入 SSE MARKET 网络
            </p>
            <div class="highlight-box">
              <div class="highlight-number">
                {{ daysJoined }}
              </div>
              <span class="unit">DAYS</span>
            </div>
            <p class="warm-message">
              {{ durationMessage }}
            </p>
            <p class="sub-text">
              你在集市的每次参与<br>都留下了独特的痕迹
            </p>
          </div>
        </div>

        <!-- Slide 3: Posting Activity -->
        <div v-else-if="currentSlide === 2" key="2" class="slide slide-posting">
          <div class="content">
            <h3 class="section-title">
              OUTPUT
            </h3>
            <p class="desc-text">
              你的输出力
            </p>
            <div class="main-stat">
              <span class="label">本年度发布</span>
              <div class="highlight-number red-glow">
                {{ reportData?.thisYearPostCnt }}
              </div>
              <span class="unit">POSTS</span>
            </div>

            <div class="tech-card">
              <div class="stat-row">
                <div class="stat-item">
                  <span class="label">累计发布</span>
                  <span class="value">{{ reportData?.totalPostCnt }}</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                  <span class="label">累计获赞</span>
                  <span class="value">{{ reportData?.totalPostLikeNum }}</span>
                </div>
              </div>
            </div>

            <p class="warm-message mt-3">
              {{ postingMessage }}
            </p>
            <p class="sub-text mt-2">
              今年收获了 {{ reportData?.thisYearLikeNum }} 次认可
            </p>
          </div>
        </div>

        <!-- Slide 4: Top Post -->
        <div v-else-if="currentSlide === 3" key="3" class="slide slide-highlight">
          <div class="content">
            <h3 class="section-title">
              MOMENT
            </h3>
            <p class="desc-text">
              你的时刻
            </p>

            <div class="hud-container">
              <div class="hud-item">
                <div class="hud-label">
                  MAX LIKES
                </div>
                <div class="hud-value color-1">
                  {{ reportData?.maxLikeNum }}
                </div>
                <div class="hud-bar" />
              </div>
              <div class="hud-item">
                <div class="hud-label">
                  MAX VIEWS
                </div>
                <div class="hud-value color-2">
                  {{ reportData?.maxBrowseNum }}
                </div>
                <div class="hud-bar" />
              </div>
              <div class="hud-item">
                <div class="hud-label">
                  MAX COMMENTS
                </div>
                <div class="hud-value color-3">
                  {{ reportData?.maxCommentNum }}
                </div>
                <div class="hud-bar" />
              </div>
            </div>

            <p class="warm-message">
              {{ momentMessage }}
            </p>
            <p class="sub-text">
              你的声音，正在回响
            </p>
          </div>
        </div>

        <!-- Slide 5: Interaction -->
        <div v-else-if="currentSlide === 4" key="4" class="slide slide-interaction">
          <div class="content">
            <h3 class="section-title">
              RESONANCE
            </h3>
            <p class="desc-text">
              你的回响
            </p>

            <div class="grid-stats-tech">
              <div class="grid-box">
                <div class="num">
                  {{ reportData?.pCommentCnt }}
                </div>
                <div class="lbl">
                  评论
                </div>
              </div>
              <div class="grid-box">
                <div class="num">
                  {{ reportData?.ccommentCnt }}
                </div>
                <div class="lbl">
                  回复
                </div>
              </div>
              <div class="grid-box">
                <div class="num">
                  {{ reportData?.savedCount }}
                </div>
                <div class="lbl">
                  收藏
                </div>
              </div>
            </div>

            <div class="tech-list">
              <div class="list-item">
                <span>被收藏</span>
                <span class="list-val">{{ reportData?.beSavedCount }}</span>
              </div>
              <div class="list-item">
                <span>被热议</span>
                <span class="list-val">{{ reportData?.beCommentedCount }}</span>
              </div>
              <div class="list-item">
                <span>被回应</span>
                <span class="list-val">{{ reportData?.repliedCount }}</span>
              </div>
            </div>

            <p class="warm-message mt-3">
              {{ resonanceMessage }}
            </p>
          </div>
        </div>

        <!-- Slide 6: Chat -->
        <div v-else-if="currentSlide === 5" key="5" class="slide slide-chat">
          <div class="content">
            <h3 class="section-title">
              CONNECTION
            </h3>
            <p class="desc-text">
              你的连接
            </p>

            <div class="msg-stat">
              <span class="highlight-number small">
                {{ reportData?.chatCount }}
              </span>
              <span class="unit">MESSAGES SENT</span>
            </div>

            <div v-if="reportData?.maxSayUser?.UserID" class="partner-card">
              <div class="card-header">
                TOP_CONNECTION
              </div>
              <div class="partner-info">
                <img :src="reportData?.maxSayUser?.AvatarURL || defaultAvatar" class="partner-avatar">
                <div class="partner-details">
                  <span class="partner-name">{{ reportData?.maxSayUser?.Name }}</span>
                  <span class="partner-msg">交互频次: {{ reportData?.maxSayUserCnt }}</span>
                </div>
              </div>
            </div>

            <!-- 显示更多好友（如果有） -->
            <div v-if="otherFriends.length > 0" class="more-friends">
              <p class="mini-title">
                ALSO CONNECTED WITH
              </p>
              <div class="friends-row">
                <img
                  v-for="user in otherFriends"
                  :key="user.UserID"
                  :src="user.AvatarURL || defaultAvatar"
                  class="mini-avatar"
                >
              </div>
            </div>

            <p class="warm-message mt-3">
              {{ connectionMessage }}
            </p>
          </div>
        </div>

        <!-- Slide 7: Summary -->
        <div v-else-if="currentSlide === 6" key="6" class="slide slide-summary">
          <div class="content">
            <h3 class="section-title">
              SUMMARY
            </h3>

            <div class="level-display">
              <div class="level-ring">
                <div class="level-content">
                  <span class="level-label">CURRENT LEVEL</span>
                  <span class="level-name">{{ levelNameHandler(reportData?.score || 0) }}</span>
                  <span class="level-exp">EXP: {{ reportData?.score }}</span>
                </div>
              </div>
            </div>

            <p class="warm-message final-message">
              {{ summaryMessage }}
            </p>

            <div class="summary-text">
              <p>SSE MARKET SYSTEM LOG: 2025 COMPLETE</p>
              <p>INITIATING 2026 SEQUENCE...</p>
            </div>

            <div class="action-buttons">
              <button class="tech-btn outline" @click.stop="restart">
                PLAY AGAIN
              </button>
              <button class="tech-btn solid" @click.stop="goHome">
                BACK TO HOME
              </button>
            </div>
          </div>
        </div>
      </transition>

      <div class="indicators">
        <div
          v-for="i in 7"
          :key="i"
          class="indicator-rect"
          :class="{ active: currentSlide === i - 1 }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

/* Music Control Button */
.music-control {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(14, 165, 233, 0.4);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.music-control:hover {
  background: rgba(14, 165, 233, 0.2);
  border-color: #0ea5e9;
  box-shadow: 0 0 15px rgba(14, 165, 233, 0.4);
}

.music-icon {
  width: 24px;
  height: 24px;
  color: #0ea5e9;
  transition: all 0.3s ease;
}

.music-icon.playing {
  animation: pulse-music 1.5s ease-in-out infinite;
}

@keyframes pulse-music {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Global Variables & Reset */
.report-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #030712; /* Very dark blue/black */
  background-image:
    radial-gradient(circle at 50% 50%, #1e3a8a 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, #be123c 0%, transparent 20%);
  color: #e2e8f0;
  overflow: hidden;
  font-family: 'Rajdhani', sans-serif;
  z-index: 9999;
}

/* Background Grid */
.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 0;
  pointer-events: none;
}

/* CRT Scan Line Effect */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: rgba(14, 165, 233, 0.3);
  opacity: 0.4;
  animation: scan 3s linear infinite;
  z-index: 999;
  pointer-events: none;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
}

@keyframes scan {
  0% {
    top: -5%;
  }
  100% {
    top: 105%;
  }
}

/* Common Layout */
.slide-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 10;
}

.slide {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  box-sizing: border-box;
}

.content {
  width: 100%;
  max-width: 450px;
  position: relative;
}

/* Text Styles */
h1,
h2,
h3,
.section-title,
.highlight-number {
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
}

.section-title {
  font-size: 2.5rem;
  color: #f43f5e; /* Rose 500 */
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.6);
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.desc-text {
  font-size: 1.1rem;
  color: #0ea5e9; /* Sky 500 */
  margin-bottom: 2rem;
  letter-spacing: 1px;
}

.sub-text {
  font-size: 1rem;
  color: #94a3b8;
  margin-top: 2rem;
  line-height: 1.6;
}

/* Warm Message - 温馨提示语 */
.warm-message {
  font-size: 1.1rem;
  color: #fbbf24;
  margin-top: 1.5rem;
  line-height: 1.8;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: fadeInUp 0.8s ease-out;
}

.warm-message.final-message {
  font-size: 1.3rem;
  color: #f472b6;
  text-shadow: 0 0 15px rgba(244, 114, 182, 0.4);
  margin-bottom: 1.5rem;
}

.mt-2 {
  margin-top: 0.75rem !important;
}

.mt-3 {
  margin-top: 1.25rem !important;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.highlight-number {
  font-size: 4.5rem;
  font-weight: 700;
  color: #0ea5e9;
  text-shadow: 0 0 15px rgba(14, 165, 233, 0.6);
  line-height: 1;
}

.highlight-number.red-glow {
  color: #f43f5e;
  text-shadow: 0 0 15px rgba(244, 63, 94, 0.6);
}

.unit {
  font-size: 1rem;
  color: #64748b;
  letter-spacing: 2px;
  font-weight: 600;
}

/* Slide 1: Cover */
.top-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 2rem;
  opacity: 0.7;
}

.deco-line {
  height: 1px;
  width: 40px;
  background: #0ea5e9;
}

.deco-text {
  font-size: 0.8rem;
  letter-spacing: 4px;
  color: #0ea5e9;
}

.main-title-box h1 {
  font-size: 6rem;
  margin: 0;
  line-height: 1;
  color: #ffffff;
  text-shadow: 4px 4px 0px #f43f5e;
}

.main-title-box h2 {
  font-size: 1.8rem;
  font-weight: 400;
  color: #0ea5e9;
  letter-spacing: 6px;
  margin-top: 0.5rem;
  margin-bottom: 3rem;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-ring {
  padding: 5px;
  border: 2px dashed #f43f5e;
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #0ea5e9;
  object-fit: cover;
  display: block; /* Fix for rotation animation alignment */
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

.greeting {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.intro-text {
  font-size: 0.9rem;
  color: #94a3b8;
  font-style: italic;
  max-width: 80%;
  margin: 0 auto;
}

.bottom-hint {
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
  animation: blink 2s infinite;
}

.hint-text {
  font-size: 0.8rem;
  letter-spacing: 3px;
  color: #f43f5e;
}

.arrow-down {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #f43f5e;
}

/* Slide 3 & 4 Components */
.tech-card {
  background: rgba(30, 58, 138, 0.2);
  border: 1px solid rgba(14, 165, 233, 0.3);
  padding: 1.5rem;
  border-radius: 4px;
  margin-top: 2rem;
  position: relative;
}

.tech-card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 10px;
  height: 10px;
  border-top: 2px solid #0ea5e9;
  border-left: 2px solid #0ea5e9;
}

.tech-card::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-bottom: 2px solid #0ea5e9;
  border-right: 2px solid #0ea5e9;
}

.stat-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(14, 165, 233, 0.3);
}

.stat-item .label {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 5px;
}

.stat-item .value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
}

.hud-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  margin-top: 2rem;
}

.hud-item {
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.3) 0%, transparent 100%);
  padding: 1rem;
  border-left: 4px solid #0ea5e9;
  position: relative;
}

.hud-label {
  font-size: 0.9rem;
  color: #94a3b8;
  letter-spacing: 2px;
  text-align: left;
  margin-bottom: 0.5rem;
}

.hud-value {
  font-size: 2.2rem;
  font-weight: 700;
  text-align: right;
  font-family: 'Orbitron', sans-serif;
}

.color-1 {
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
}
.color-2 {
  color: #0ea5e9;
  text-shadow: 0 0 10px rgba(14, 165, 233, 0.4);
}
.color-3 {
  color: #eab308;
  text-shadow: 0 0 10px rgba(234, 179, 8, 0.4);
}

/* Slide 5 Interaction */
.grid-stats-tech {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  width: 100%;
  margin-bottom: 2rem;
}

.grid-box {
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(244, 63, 94, 0.3);
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.grid-box::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #f43f5e;
  box-shadow: 0 0 8px #f43f5e;
}

.grid-box .num {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
}

.grid-box .lbl {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 5px;
}

.tech-list {
  width: 100%;
  border-top: 1px dashed rgba(14, 165, 233, 0.3);
  padding-top: 1rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(14, 165, 233, 0.1);
  font-size: 1.1rem;
  color: #cbd5e1;
}

.list-val {
  font-family: 'Orbitron', sans-serif;
  color: #0ea5e9;
  font-weight: 700;
}

/* Slide 6 Chat */
.partner-card {
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #0ea5e9;
  margin-top: 2rem;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  background: #0ea5e9;
  color: #000;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 10px;
  text-align: left;
  letter-spacing: 2px;
}

.partner-info {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 1.5rem;
}

.partner-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid #f43f5e;
}

.partner-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.partner-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 5px;
}

.partner-msg {
  font-size: 0.9rem;
  color: #94a3b8;
}

.more-friends {
  margin-top: 2rem;
  width: 100%;
}

.mini-title {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-align: left;
}

.friends-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(14, 165, 233, 0.5);
  filter: grayscale(0.5);
  transition: all 0.3s;
}

.mini-avatar:hover {
  filter: grayscale(0);
  transform: scale(1.1);
}

/* Slide 7 Summary */
.level-ring {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid #1e293b;
  border-top-color: #f43f5e;
  border-right-color: #f43f5e;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem auto;
  position: relative;
  box-shadow: 0 0 30px rgba(244, 63, 94, 0.1);
  animation: pulse-ring 3s infinite;
}

.level-ring::before {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 1px dashed #0ea5e9;
  animation: rotate-rev 20s linear infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);
  }
  50% {
    box-shadow: 0 0 50px rgba(244, 63, 94, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.1);
  }
}

@keyframes rotate-rev {
  100% {
    transform: rotate(-360deg);
  }
}

.level-content {
  display: flex;
  flex-direction: column;
}

.level-label {
  font-size: 0.8rem;
  color: #64748b;
  letter-spacing: 1px;
}

.level-name {
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 10px #fff;
  margin: 5px 0;
}

.level-exp {
  font-size: 0.9rem;
  color: #0ea5e9;
  font-family: 'Orbitron', sans-serif;
}

.summary-text {
  font-family: 'Orbitron', monospace;
  color: #0ea5e9;
  font-size: 0.9rem;
  margin-bottom: 3rem;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
}

.tech-btn {
  padding: 12px 30px;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
}

.tech-btn.outline {
  background: transparent;
  border: 1px solid #0ea5e9;
  color: #0ea5e9;
}

.tech-btn.outline:hover {
  background: rgba(14, 165, 233, 0.1);
  box-shadow: 0 0 15px rgba(14, 165, 233, 0.4);
}

.tech-btn.solid {
  background: #f43f5e;
  border: 1px solid #f43f5e;
  color: #fff;
}

.tech-btn.solid:hover {
  background: #be123c;
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.5);
}

/* Indicators */
.indicators {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.indicator-rect {
  width: 4px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.indicator-rect.active {
  background: #f43f5e;
  height: 35px;
  box-shadow: 0 0 10px #f43f5e;
}

/* Loading */
.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 20;
}

.tech-spinner {
  width: 50px;
  height: 50px;
  border: 2px solid rgba(14, 165, 233, 0.3);
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.spinner-inner {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(244, 63, 94, 0.3);
  border-bottom-color: #f43f5e;
  border-radius: 50%;
  margin: 8px auto;
  animation: spin 0.5s reverse linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.3;
  }
}

.loading-text {
  font-family: 'Orbitron', monospace;
  color: #0ea5e9;
  letter-spacing: 2px;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
  filter: blur(10px);
}
.slide-up-leave-to {
  transform: translateY(-20%);
  opacity: 0;
  filter: blur(5px);
}
.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
  filter: blur(10px);
}
.slide-down-leave-to {
  transform: translateY(20%);
  opacity: 0;
  filter: blur(5px);
}
</style>
