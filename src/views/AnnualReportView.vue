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
const autoPlayAttempted = ref(false)
const musicEnergy = ref(1) // 1 是基础值
let beatTimer: number | null = null

// 模拟律动引擎
function startBeatAnimation() {
  if (beatTimer)
    cancelAnimationFrame(beatTimer)

  const animate = (timestamp: number) => {
    // 两段缓慢正弦叠加 + 轻微心跳感
    const slowBreath = Math.sin(timestamp / 900) * 0.12
    const softWave = Math.sin(timestamp / 2600) * 0.08
    const gentlePulse = Math.max(0, Math.sin(timestamp / 600)) * 0.06
    const targetEnergy = 1 + slowBreath + softWave + gentlePulse

    // 平滑插值，避免闪烁
    musicEnergy.value += (targetEnergy - musicEnergy.value) * 0.08

    if (isPlaying.value) {
      beatTimer = requestAnimationFrame(animate)
    }
    else {
      musicEnergy.value = 1 // 停止时重置
    }
  }

  beatTimer = requestAnimationFrame(animate)
}

function stopBeatAnimation() {
  if (beatTimer) {
    cancelAnimationFrame(beatTimer)
    beatTimer = null
  }
  // 平滑恢复到默认状态
  musicEnergy.value = 1
}

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
    stopBeatAnimation()
  }
  else {
    // 用户主动点击按钮，属于用户手势，通常允许播放
    audioRef.value.play().then(() => {
      isPlaying.value = true
      startBeatAnimation()
    }).catch((e) => {
      console.log('Toggle play failed:', e)
    })
  }
}

// 尝试播放音乐（核心方法）
function tryPlayMusic(mute = false) {
  if (!audioRef.value)
    return Promise.resolve()

  const audio = audioRef.value
  if (mute) {
    audio.muted = true
  }

  return audio.play()
    .then(() => {
      // 播放成功
      isPlaying.value = true
      startBeatAnimation()
      // 如果是静音播放成功的，不再需要自动播放逻辑了，但需要恢复音量
      if (mute) {
        // 静音播放成功后，等待下一次交互恢复音量
        const unmute = () => {
          if (audio) {
            audio.muted = false
          }
          document.removeEventListener('click', unmute)
          document.removeEventListener('touchstart', unmute)
        }
        document.addEventListener('click', unmute, { once: true })
        document.addEventListener('touchstart', unmute, { once: true })
      }
    })
    .catch((e) => {
      // 播放失败
      console.log(`Play failed (muted=${mute}):`, e)
      isPlaying.value = false
      stopBeatAnimation()
      if (mute) {
        // 如果静音播放也失败，确保静音状态复位，以免下次播放无声
        audio.muted = false
      }
      throw e
    })
}

// 自动播放逻辑
function initAutoPlay() {
  if (autoPlayAttempted.value)
    return
  autoPlayAttempted.value = true

  // 1. 微信环境特殊处理
  if (isWechat()) {
    if (typeof (window as any).WeixinJSBridge !== 'undefined') {
      (window as any).WeixinJSBridge.invoke('getNetworkType', {}, () => {
        tryPlayMusic(false).catch(() => tryPlayMusic(true))
      })
    }
    else {
      document.addEventListener('WeixinJSBridgeReady', () => {
        (window as any).WeixinJSBridge.invoke('getNetworkType', {}, () => {
          tryPlayMusic(false).catch(() => tryPlayMusic(true))
        })
      }, { once: true })
    }
    return
  }

  // 2. 普通浏览器尝试直接播放
  tryPlayMusic(false)
    .catch(() => {
      // 3. 失败则尝试静音播放
      console.log('Direct auto play failed, trying muted...')
      return tryPlayMusic(true)
    })
    .catch(() => {
      console.log('All auto play attempts failed, waiting for user interaction')
    })
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

// 动态提示语
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
  // 交互时尝试播放（如果尚未播放）
  if (!isPlaying.value) {
    tryPlayMusic(false)
  }
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
    stopBeatAnimation()
  }
  router.push('/')
}

// 导出报告长图
async function exportReport() {
  try {
    // 1. 确保字体已加载
    await document.fonts.ready

    // 创建 Canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文')
    }

    const width = 750 // 增加宽度以提高清晰度
    const slideHeight = 1000 // 增加每页高度
    const totalHeight = slideHeight * 7
    canvas.width = width
    canvas.height = totalHeight

    // 绘制背景
    ctx.fillStyle = '#030712'
    ctx.fillRect(0, 0, width, totalHeight)

    // 绘制背景网格 (模拟 CSS background-grid)
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, totalHeight)
      ctx.stroke()
    }
    for (let y = 0; y <= totalHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 绘制全局渐变背景 (模拟 CSS radial-gradient)
    const gradient1 = ctx.createRadialGradient(width * 0.5, totalHeight * 0.5, 0, width * 0.5, totalHeight * 0.5, width * 0.8)
    gradient1.addColorStop(0, 'rgba(49, 46, 129, 0.4)')
    gradient1.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient1
    ctx.fillRect(0, 0, width, totalHeight)

    const gradient2 = ctx.createRadialGradient(width * 0.8, totalHeight * 0.2, 0, width * 0.8, totalHeight * 0.2, width * 0.5)
    gradient2.addColorStop(0, 'rgba(190, 18, 60, 0.2)')
    gradient2.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient2
    ctx.fillRect(0, 0, width, totalHeight)

    // 辅助函数：绘制发光文字
    const drawGlowText = (text: string, x: number, y: number, font: string, color: string, glowColor: string, blur: number = 10) => {
      ctx.save()
      ctx.font = font
      ctx.fillStyle = color
      ctx.shadowColor = glowColor
      ctx.shadowBlur = blur
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, x, y)
      ctx.restore()
    }

    // 辅助函数：绘制装饰线
    const drawDecoLine = (y: number) => {
      ctx.save()
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(width * 0.2, y)
      ctx.lineTo(width * 0.8, y)
      ctx.stroke()
      // 中间加个点
      ctx.fillStyle = '#0ea5e9'
      ctx.beginPath()
      ctx.arc(width / 2, y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    let currentY = 150

    // --- 封面页 ---
    drawGlowText('2025', width / 2, currentY, 'bold 6rem Orbitron', '#ffffff', '#f43f5e', 20)
    currentY += 80
    drawGlowText('集市年度报告', width / 2, currentY, '2.5rem Rajdhani', '#0ea5e9', '#0ea5e9', 10)
    currentY += 150

    // 头像绘制
    if (reportData.value?.avatarUrl) {
      try {
        const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
        const avatarImg = await loadImg(reportData.value.avatarUrl)
        ctx.save()
        ctx.beginPath()
        ctx.arc(width / 2, currentY, 80, 0, Math.PI * 2)
        ctx.strokeStyle = '#0ea5e9'
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.clip()
        ctx.drawImage(avatarImg, width / 2 - 80, currentY - 80, 160, 160)
        ctx.restore()
        currentY += 160
      }
      catch {
        // 头像加载失败
      }
    }
    currentY += 60
    drawGlowText(reportData.value?.name || 'User', width / 2, currentY, 'bold 2rem Rajdhani', '#ffffff', '#ffffff', 5)
    currentY += 200

    drawDecoLine(currentY)
    currentY += 100

    // --- 数据页 ---
    const slides = [
      { title: 'START', desc: '已接入 SSE MARKET 网络', value: `${daysJoined.value}`, unit: 'DAYS' },
      { title: 'OUTPUT', desc: '你的输出力', value: `${reportData.value?.thisYearPostCnt || 0}`, unit: 'POSTS' },
      {
        title: 'MOMENT',
        desc: '你的时刻',
        stats: [
          { l: 'MAX LIKES', v: reportData.value?.maxLikeNum || 0 },
          { l: 'MAX VIEWS', v: reportData.value?.maxBrowseNum || 0 },
          { l: 'MAX COMMENTS', v: reportData.value?.maxCommentNum || 0 },
        ],
      },
      {
        title: 'RESONANCE',
        desc: '你的回响',
        stats: [
          { l: 'COMMENTS', v: (reportData.value?.pCommentCnt || 0) + (reportData.value?.ccommentCnt || 0) },
          { l: 'SAVED', v: reportData.value?.savedCount || 0 },
          { l: 'REPLIED', v: reportData.value?.repliedCount || 0 },
        ],
      },
      { title: 'CONNECTION', desc: '你的连接', value: `${reportData.value?.chatCount || 0}`, unit: 'MESSAGES' },
      { title: 'SUMMARY', desc: levelNameHandler(reportData.value?.score || 0), value: `${reportData.value?.score || 0}`, unit: 'EXP', isFinal: true },
    ]

    for (const slide of slides) {
      // 标题
      drawGlowText(slide.title, width / 2, currentY, 'bold 3rem Orbitron', '#f43f5e', '#f43f5e', 15)
      currentY += 60
      drawGlowText(slide.desc, width / 2, currentY, '1.5rem Rajdhani', '#0ea5e9', '#0ea5e9', 5)
      currentY += 100

      // 主要数值
      if (slide.value) {
        drawGlowText(slide.value, width / 2, currentY, 'bold 6rem Orbitron', '#ffffff', '#0ea5e9', 20)
        currentY += 70
        drawGlowText(slide.unit, width / 2, currentY, '1.2rem Rajdhani', '#64748b', 'transparent', 0)
        currentY += 120
      }

      // 统计列表
      if (slide.stats) {
        let statY = currentY
        for (const stat of slide.stats) {
          // 背景框
          ctx.fillStyle = 'rgba(30, 58, 138, 0.2)'
          ctx.fillRect(width * 0.15, statY - 40, width * 0.7, 80)
          ctx.strokeStyle = '#0ea5e9'
          ctx.lineWidth = 1
          ctx.strokeRect(width * 0.15, statY - 40, width * 0.7, 80)

          // 标签和数值
          ctx.fillStyle = '#94a3b8'
          ctx.font = '1.2rem Rajdhani'
          ctx.textAlign = 'left'
          ctx.fillText(stat.l, width * 0.2, statY)

          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 2rem Orbitron'
          ctx.textAlign = 'right'
          ctx.fillText(`${stat.v}`, width * 0.8, statY)

          statY += 100
        }
        currentY = statY + 50
      }

      if (!slide.isFinal) {
        drawDecoLine(currentY)
        currentY += 120
      }
    }

    // 底部 Logo
    currentY += 50
    drawGlowText('SSE MARKET ANNUAL REPORT', width / 2, currentY, '1rem Orbitron', '#64748b', 'transparent', 0)

    // 导出图片
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `SSEMARKET_年度报告_${new Date().getFullYear()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png', 1.0)
  }
  catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请稍后重试')
  }
}

onUnmounted(() => {
  // 组件卸载时停止音乐
  stopBeatAnimation()
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
    initAutoPlay()
  }, 500)
})
</script>

<template>
  <div class="report-container" :style="{ '--music-energy': musicEnergy }">
    <!-- 动态光影层 -->
    <div class="ambient-light warm" />
    <div class="ambient-light cool" />

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
                  <br>
                  最多点赞
                </div>
                <div class="hud-value color-1">
                  {{ reportData?.maxLikeNum }}
                </div>
                <div class="hud-bar" />
              </div>
              <div class="hud-item">
                <div class="hud-label">
                  MAX VIEWS
                  <br>
                  最多观看
                </div>
                <div class="hud-value color-2">
                  {{ reportData?.maxBrowseNum }}
                </div>
                <div class="hud-bar" />
              </div>
              <div class="hud-item">
                <div class="hud-label">
                  MAX COMMENTS
                  <br>
                  最多评论
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
              CHAT
            </h3>
            <p class="desc-text">
              你的私信
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
                ALSO CHATTED WITH
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
                REPLAY
              </button>
              <button class="tech-btn outline export-btn" @click.stop="exportReport">
                EXPORT
              </button>
              <button class="tech-btn solid" @click.stop="goHome">
                EXIT
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
  /* 调整为更温馨的深紫色基调，并让光晕范围跟随音乐微动 */
  background-image:
    radial-gradient(circle at 50% 50%, #312e81 0%, transparent calc(55% * var(--music-energy))),
    radial-gradient(circle at 80% 20%, #be123c 0%, transparent calc(25% * var(--music-energy)));
  transition: background-image 0.2s ease;
  color: #e2e8f0;
  overflow: hidden;
  font-family: 'Rajdhani', sans-serif;
  z-index: 9999;
  --music-energy: 1;
}

/* Ambient Light */
.ambient-light {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.ambient-light.warm {
  background: radial-gradient(circle at 30% 40%, rgba(251, 191, 36, 0.15) 0%, transparent 60%);
  transform: scale(var(--music-energy));
  filter: blur(40px);
  mix-blend-mode: screen;
}

.ambient-light.cool {
  background: radial-gradient(circle at 70% 60%, rgba(244, 114, 182, 0.1) 0%, transparent 50%);
  transform: scale(calc(var(--music-energy) * 0.9));
  filter: blur(50px);
  mix-blend-mode: screen;
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
  animation: gentleFloat 1s cubic-bezier(0.23, 1, 0.32, 1) both;
}

.desc-text {
  font-size: 1.1rem;
  color: #0ea5e9; /* Sky 500 */
  margin-bottom: 2rem;
  letter-spacing: 1px;
  animation: softFadeIn 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both;
}

.sub-text {
  font-size: 1rem;
  color: #94a3b8;
  margin-top: 2rem;
  line-height: 1.6;
  animation: softRise 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.9s both;
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
  animation: warmBreath 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.7s both;
}

.warm-message.final-message {
  font-size: 1.3rem;
  color: #f472b6;
  text-shadow: 0 0 15px rgba(244, 114, 182, 0.4);
  margin-bottom: 1.5rem;
  animation: warmBreath 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both;
}

.mt-2 {
  margin-top: 0.75rem !important;
}

.mt-3 {
  margin-top: 1.25rem !important;
}

/* 温馨风格动画 - 柔和、流畅、有节奏感 */

/* 标题：轻柔浮入 */
@keyframes gentleFloat {
  0% {
    opacity: 0;
    transform: translateY(-20px);
    filter: blur(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* 描述文字：柔和淡入 */
@keyframes softFadeIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 辅助文字：轻柔上升 */
@keyframes softRise {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 温馨提示：呼吸感淡入 */
@keyframes warmBreath {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  70% {
    opacity: 1;
    transform: translateY(-3px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 数字：柔和放大浮入 */
@keyframes numberFloat {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(15px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

/* 卡片：轻柔浮入 */
@keyframes cardGentleIn {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.highlight-number {
  font-size: 4.5rem;
  font-weight: 700;
  color: #0ea5e9;
  text-shadow: 0 0 15px rgba(14, 165, 233, 0.6);
  animation: numberFloat 1s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both;
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
  animation: rotate 12.5s linear infinite;
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
  animation: cardGentleIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
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

.hud-container .hud-item:nth-child(1) {
  animation: hudSlideIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both;
}

.hud-container .hud-item:nth-child(2) {
  animation: hudSlideIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.55s both;
}

.hud-container .hud-item:nth-child(3) {
  animation: hudSlideIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.7s both;
}

/* HUD 项目：柔和渐入 */
@keyframes hudSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-15px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
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

.grid-stats-tech .grid-box:nth-child(1) {
  animation: boxFadeIn 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both;
}

.grid-stats-tech .grid-box:nth-child(2) {
  animation: boxFadeIn 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.55s both;
}

.grid-stats-tech .grid-box:nth-child(3) {
  animation: boxFadeIn 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.7s both;
}

/* 网格盒子：柔和浮入 */
@keyframes boxFadeIn {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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

.tech-list .list-item:nth-child(1) {
  animation: listFadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
}

.tech-list .list-item:nth-child(2) {
  animation: listFadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.75s both;
}

.tech-list .list-item:nth-child(3) {
  animation: listFadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.9s both;
}

/* 列表项：柔和淡入 */
@keyframes listFadeIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
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
  animation: cardFadeUp 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both;
}

/* 好友卡片：柔和上浮 */
@keyframes cardFadeUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
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
  animation:
    ringGentleEnter 1s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both,
    pulse-ring 3s infinite 1.3s;
}

/* 等级圆环：柔和缩放进入 */
@keyframes ringGentleEnter {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
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
  animation: textSoftFade 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.8s both;
}

/* 总结文字：柔和淡入 */
@keyframes textSoftFade {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  animation: buttonsFadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) 1.1s both;
}

/* 桌面端横向排列 */
@media (min-width: 480px) {
  .action-buttons {
    flex-direction: row;
    gap: 1.5rem;
    justify-content: center;
  }
}

/* 按钮：柔和淡入 */
@keyframes buttonsFadeIn {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
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
  width: 100%;
  flex: 1;
}

/* 桌面端按钮宽度自适应 */
@media (min-width: 480px) {
  .tech-btn {
    width: auto;
    flex: 0 1 auto;
  }
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
