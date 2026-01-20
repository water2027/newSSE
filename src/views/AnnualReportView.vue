<script setup lang="ts">
import type { AnnualReportData } from '@/api/info/getAnnualReport'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAnnualReport } from '@/api/info/getAnnualReport'
import { levelNameHandler } from '@/utils/level'

const router = useRouter()

const loading = ref(true)
const reportData = ref<AnnualReportData | null>(null)
const currentSlide = ref(0)
const transitionName = ref('slide-up')

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

function handleInteraction() {
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
  router.push('/')
}

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

onMounted(async () => {
  // Date Check
  const now = new Date().getTime()
  const start = new Date('2026-01-20T00:00:00').getTime()
  const end = new Date('2026-02-27T23:59:59').getTime()

  if (now < start || now > end) {
    alert('不在活动时间内')
    router.replace('/')
    return
  }

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
})
</script>

<template>
  <div class="report-container">
    <div v-if="loading" class="loading-screen">
      <div class="spinner" />
      <p>正在生成您的2025年度报告...</p>
    </div>

    <div v-else class="slide-container" @click="handleInteraction" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <transition :name="transitionName">
        <!-- Slide 1: Cover -->
        <div v-if="currentSlide === 0" key="0" class="slide slide-1">
          <div class="content">
            <div class="logo">
              SSE Market
            </div>
            <h1>2025</h1>
            <h2>年度报告</h2>
            <p class="greeting">
              Hi, {{ reportData?.name }}
            </p>
            <div class="avatar-container">
              <img :src="reportData?.avatarUrl || defaultAvatar" alt="Avatar" class="avatar">
            </div>
            <p class="hint">
              点击或滑动开启
            </p>
            <div class="arrow-down">
              ↓
            </div>
          </div>
        </div>

        <!-- Slide 2: Duration -->
        <div v-else-if="currentSlide === 1" key="1" class="slide slide-2">
          <div class="content">
            <h3>缘起</h3>
            <p>我们相识已经</p>
            <div class="highlight-number">
              {{ daysJoined }} <span class="unit">天</span>
            </div>
            <p class="sub-text">
              在 SSE Market 的每一天<br>都值得纪念
            </p>
          </div>
        </div>

        <!-- Slide 3: Posting Activity -->
        <div v-else-if="currentSlide === 2" key="2" class="slide slide-3">
          <div class="content">
            <h3>创作</h3>
            <p>2025年，你发布了</p>
            <div class="highlight-number">
              {{ reportData?.thisYearPostCnt }} <span class="unit">篇</span>
            </div>
            <p>帖子</p>
            <div class="stat-row">
              <div class="stat-item">
                <span class="label">累计获赞</span>
                <span class="value">{{ reportData?.totalPostLikeNum }}</span>
              </div>
              <div class="stat-item">
                <span class="label">今年获赞</span>
                <span class="value">{{ reportData?.thisYearLikeNum }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 4: Top Post -->
        <div v-else-if="currentSlide === 3" key="3" class="slide slide-4">
          <div class="content">
            <h3>高光时刻</h3>
            <p>你的某个瞬间特别闪耀</p>
            <div class="card">
              <div class="card-row">
                <span>最高点赞</span>
                <span class="card-val">{{ reportData?.maxLikeNum }}</span>
              </div>
              <div class="card-row">
                <span>最高浏览</span>
                <span class="card-val">{{ reportData?.maxBrowseNum }}</span>
              </div>
              <div class="card-row">
                <span>最高评论</span>
                <span class="card-val">{{ reportData?.maxCommentNum }}</span>
              </div>
            </div>
            <p class="sub-text">
              你的分享，引人注目
            </p>
          </div>
        </div>

        <!-- Slide 5: Interaction -->
        <div v-else-if="currentSlide === 4" key="4" class="slide slide-5">
          <div class="content">
            <h3>互动</h3>
            <p>你依然热衷于交流</p>
            <div class="grid-stats">
              <div class="grid-item">
                <div class="num">
                  {{ reportData?.pCommentCnt }}
                </div>
                <div class="lbl">
                  评论数
                </div>
              </div>
              <div class="grid-item">
                <div class="num">
                  {{ reportData?.ccommentCnt }}
                </div>
                <div class="lbl">
                  回复数
                </div>
              </div>
              <div class="grid-item">
                <div class="num">
                  {{ reportData?.savedCount }}
                </div>
                <div class="lbl">
                  收藏数
                </div>
              </div>
            </div>
            <p class="sub-text mt-4">
              同时也收获了 {{ reportData?.beSavedCount }} 次收藏
            </p>
          </div>
        </div>

        <!-- Slide 6: Chat -->
        <div v-else-if="currentSlide === 5" key="5" class="slide slide-6">
          <div class="content">
            <h3>连接</h3>
            <p>这一年，你一共发出了</p>
            <div class="highlight-number">
              {{ reportData?.chatCount }} <span class="unit">条</span>
            </div>
            <p>私信消息</p>

            <div v-if="reportData?.maxSayUser?.UserID" class="friend-card">
              <p>你与之畅聊最多的人是</p>
              <div class="friend-info">
                <img :src="reportData?.maxSayUser?.AvatarURL || defaultAvatar" class="friend-avatar">
                <span class="friend-name">{{ reportData?.maxSayUser?.Name }}</span>
              </div>
              <p class="friend-stat">
                {{ reportData?.maxSayUserCnt }} 条消息往来
              </p>
            </div>
            <div v-else class="friend-card">
              <p>似乎你更喜欢在公开广场交流</p>
            </div>
          </div>
        </div>

        <!-- Slide 7: Summary -->
        <div v-else-if="currentSlide === 6" key="6" class="slide slide-7">
          <div class="content">
            <h3>总结</h3>
            <div class="score-circle">
              <div class="score-label">
                当前等级
              </div>
              <div class="score-val level-text">
                {{ levelNameHandler(reportData?.score || 0) }}
              </div>
              <div class="score-exp">
                经验值: {{ reportData?.score }}
              </div>
            </div>

            <p class="end-quote">
              感谢你的一路相伴
            </p>
            <p class="end-quote">
              2026，我们继续同行
            </p>

            <button class="replay-btn" @click.stop="restart">
              再看一遍
            </button>
            <button class="home-btn" @click.stop="goHome">
              返回首页
            </button>
          </div>
        </div>
      </transition>

      <div class="indicators">
        <div
          v-for="i in 7"
          :key="i"
          class="indicator-dot"
          :class="{ active: currentSlide === i - 1 }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.report-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #2a0a0a;
  color: #fff;
  overflow: hidden;
  font-family: 'SimSun', 'FangSong', 'Noto Serif SC', 'Times New Roman', serif;
  z-index: 9999;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #fbbf24;
  background: #2a0a0a;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(251, 191, 36, 0.2);
  border-top: 4px solid #fbbf24;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.slide-container {
  width: 100%;
  height: 100%;
  position: relative;
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
  background-size: cover;
  background-position: center;
}

/* Slide Specific Styles - Chinese New Year Theme */

/* Slide 1: Cover - Red Lanterns Pattern */
.slide-1 {
  background-color: #7f1d1d;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill-opacity='0.1'%3E%3Cpath fill='%23fbbf24' d='M50 0 C20 0 10 30 10 50 C10 70 20 100 50 100 C80 100 90 70 90 50 C90 30 80 0 50 0 Z M50 90 C30 90 20 70 20 50 C20 30 30 10 50 10 C70 10 80 30 80 50 C80 70 70 90 50 90 Z' /%3E%3C/svg%3E");
  background-size: 150px 150px;
}

/* Slide 2: Duration - Cloud Pattern */
.slide-2 {
  background-color: #991b1b;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 30' width='100' height='60' fill='none'%3E%3Cpath stroke='%23fca5a5' stroke-width='1' stroke-opacity='0.2' d='M10 25 Q 5 25 5 20 Q 5 10 15 10 Q 20 0 30 5 Q 35 0 45 10 Q 50 15 45 25 Z' /%3E%3C/svg%3E");
}

/* Slide 3: Posting - Fan Pattern */
.slide-3 {
  background-color: #b91c1c;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60' width='200' height='120'%3E%3Cpath fill='none' stroke='%23fbbf24' stroke-width='1' stroke-opacity='0.1' d='M50 60 L10 10 M50 60 L30 5 M50 60 L50 2 M50 60 L70 5 M50 60 L90 10 M10 10 Q50 -10 90 10' /%3E%3C/svg%3E");
}

/* Slide 4: High - Firework Burst */
.slide-4 {
  background-color: #450a0a;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'%3E%3Cg stroke='%23fbbf24' stroke-width='1' stroke-opacity='0.2'%3E%3Cline x1='50' y1='50' x2='50' y2='20' /%3E%3Cline x1='50' y1='50' x2='80' y2='50' /%3E%3Cline x1='50' y1='50' x2='50' y2='80' /%3E%3Cline x1='50' y1='50' x2='20' y2='50' /%3E%3Cline x1='50' y1='50' x2='70' y2='30' /%3E%3Cline x1='50' y1='50' x2='70' y2='70' /%3E%3Cline x1='50' y1='50' x2='30' y2='70' /%3E%3Cline x1='50' y1='50' x2='30' y2='30' /%3E%3C/g%3E%3C/svg%3E");
}

/* Slide 5: Interaction - Knot Pattern */
.slide-5 {
  background-color: #881337;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='80' height='80'%3E%3Crect x='10' y='10' width='20' height='20' transform='rotate(45 20 20)' fill='none' stroke='%23fca5a5' stroke-width='1' stroke-opacity='0.2' /%3E%3Crect x='15' y='15' width='10' height='10' transform='rotate(45 20 20)' fill='%23fca5a5' fill-opacity='0.1' /%3E%3C/svg%3E");
}

/* Slide 6: Chat - Coin Pattern */
.slide-6 {
  background-color: #7f1d1d;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='60' height='60'%3E%3Ccircle cx='20' cy='20' r='15' fill='none' stroke='%23fbbf24' stroke-width='1' stroke-opacity='0.15' /%3E%3Crect x='14' y='14' width='12' height='12' fill='none' stroke='%23fbbf24' stroke-width='1' stroke-opacity='0.15' /%3E%3C/svg%3E");
}

/* Slide 7: Summary - Gold Dust on Dark Red */
.slide-7 {
  background-color: #2a0a0a;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'%3E%3Ccircle cx='100' cy='50' r='1' fill='%23fbbf24' fill-opacity='0.5' /%3E%3Ccircle cx='50' cy='150' r='2' fill='%23fbbf24' fill-opacity='0.3' /%3E%3Ccircle cx='150' cy='120' r='1.5' fill='%23fbbf24' fill-opacity='0.4' /%3E%3Ccircle cx='20' cy='20' r='1' fill='%23fbbf24' fill-opacity='0.6' /%3E%3C/svg%3E");
}

.content {
  z-index: 2;
  width: 100%;
  max-width: 500px;
}

.logo {
  font-size: 1.2rem;
  opacity: 0.8;
  letter-spacing: 4px;
  margin-bottom: 2rem;
  font-weight: 500;
  color: #fbbf24;
}

h1 {
  font-size: 5rem;
  margin: 0;
  /* Gold Gradient */
  background: linear-gradient(to bottom, #fbbf24, #d97706);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

h2 {
  font-size: 2.2rem;
  margin: 0.5rem 0 3rem 0;
  font-weight: 400;
  opacity: 0.9;
  letter-spacing: 4px;
  color: #fef3c7;
}

h3 {
  font-size: 2rem;
  color: #fbbf24; /* Amber/Gold */
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
  padding-bottom: 0.8rem;
  font-weight: 700;
  border-bottom: none;
}
/* Chinese Scroll Style Underline */
h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: #fbbf24;
  border-radius: 2px;
  box-shadow: 0 0 5px rgba(251, 191, 36, 0.5);
}

.greeting {
  font-size: 1.8rem;
  margin-bottom: 2.5rem;
  font-weight: 400;
  color: #fff;
}

.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 4px solid #fbbf24;
  padding: 2px;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
  object-fit: cover;
}

.hint {
  margin-top: 4rem;
  opacity: 0.7;
  font-size: 1rem;
  letter-spacing: 2px;
  animation: pulse 2s infinite;
  color: #fcd34d;
}

.arrow-down {
  margin-top: 0.8rem;
  opacity: 0.7;
  font-size: 1.4rem;
  color: #fcd34d;
  animation: bounce 2s infinite;
}

.highlight-number {
  font-size: 5rem;
  font-weight: 800;
  /* White to Gold */
  background: linear-gradient(to bottom right, #ffffff, #fbbf24);
  -webkit-background-clip: text;
  color: transparent;
  margin: 1.5rem 0;
  line-height: 1;
  font-family: 'Times New Roman', serif; /* Numbers look good in serif */
}

.unit {
  font-size: 1.4rem;
  font-weight: 400;
  color: #fcd34d;
  margin-left: 5px;
  vertical-align: baseline;
  font-family: 'FangSong', serif;
}

.sub-text {
  font-size: 1.2rem;
  line-height: 1.8;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 1rem;
  color: #fef3c7;
}

.stat-row {
  display: flex;
  justify-content: space-evenly;
  margin-top: 3rem;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 1rem;
  opacity: 0.7;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  color: #fcd34d;
}

.value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Times New Roman', serif;
}

/* Red Packet / Traditional Card Style */
.card {
  background: rgba(127, 29, 29, 0.6);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(5px);
  margin: 2.5rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
}
/* Corner Ornaments */
.card::before {
  content: '';
  position: absolute;
  top: 5px; left: 5px;
  width: 15px; height: 15px;
  border-top: 2px solid #fbbf24;
  border-left: 2px solid #fbbf24;
}
.card::after {
  content: '';
  position: absolute;
  bottom: 5px; right: 5px;
  width: 15px; height: 15px;
  border-bottom: 2px solid #fbbf24;
  border-right: 2px solid #fbbf24;
}

.card-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
  font-size: 1.2rem;
  border-bottom: 1px dashed rgba(251, 191, 36, 0.2);
  padding-bottom: 0.8rem;
  align-items: center;
}

.card-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.card-val {
  font-weight: 700;
  color: #fbbf24; 
  font-size: 1.4rem;
  font-family: 'Times New Roman', serif;
}

.grid-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.2rem;
  margin-top: 2.5rem;
}

.grid-item {
  background: rgba(127, 29, 29, 0.6);
  border: 1px solid rgba(251, 191, 36, 0.2);
  padding: 1.5rem 0.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.num {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  font-family: 'Times New Roman', serif;
}

.lbl {
  font-size: 0.9rem;
  opacity: 0.8;
  letter-spacing: 1px;
  color: #fcd34d;
}

.friend-card {
  background: rgba(127, 29, 29, 0.5);
  border: 1px solid rgba(251, 191, 36, 0.25);
  padding: 2.5rem 2rem;
  border-radius: 16px;
  margin-top: 2.5rem;
  backdrop-filter: blur(5px);
}

.friend-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.friend-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #fbbf24;
  padding: 3px;
}

.friend-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fef3c7;
}

.friend-stat {
  color: #fbbf24;
  font-weight: 600;
  font-size: 1.1rem;
}

.score-circle {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto 3rem auto;
  z-index: 1;
  background: rgba(42, 10, 10, 0.8);
  border: 4px solid #fbbf24;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.2);
}

.score-label {
  font-size: 1.2rem;
  opacity: 0.8;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  color: #fcd34d;
}

.level-text {
  font-size: 2.6rem;
  font-weight: bold;
  background: linear-gradient(to right, #fbbf24, #fef3c7, #fbbf24);
  -webkit-background-clip: text;
  color: transparent;
  margin: 0.5rem 0;
}

.score-exp {
  font-size: 1.1rem;
  opacity: 0.7;
  color: #fcd34d;
  font-family: 'Times New Roman', serif;
}

.end-quote {
  font-size: 1.4rem;
  margin: 0.6rem 0;
  font-weight: 400;
  opacity: 0.9;
  letter-spacing: 1px;
  color: #fef3c7;
}

.replay-btn,
.home-btn {
  margin: 15px 10px;
  padding: 12px 35px;
  font-size: 1.1rem;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 1px;
  font-family: 'FangSong', serif;
}

.replay-btn {
  background: transparent;
  color: #fbbf24;
  border: 1px solid #fbbf24;
}

.home-btn {
  background: #b91c1c; /* Red */
  color: #fff;
  border: 1px solid #b91c1c;
  box-shadow: 0 4px 15px rgba(185, 28, 28, 0.4);
}

.replay-btn:active,
.home-btn:active {
  transform: scale(0.95);
}

.indicators {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 10;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.4s ease;
  border: 1px solid transparent;
}

.indicator-dot.active {
  background: #fbbf24;
  transform: scale(1.4);
  border-color: #fbbf24;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.bg-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.15;
  pointer-events: none;
  /* background-repeat is set in individual classes */
}
.bg-svg-end {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 300px;
  z-index: 1;
  opacity: 0.1;
  pointer-events: none;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.7s ease-in-out;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0.5;
}
.slide-up-leave-to {
  transform: translateY(-50%);
  opacity: 0;
}
.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0.5;
}
.slide-down-leave-to {
  transform: translateY(50%);
  opacity: 0;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}
</style>
