<template>
    <div id="root">
        <header>
            <video autoplay="autoplay" loop="loop" muted="muted" playsinline="">
                <source
                    src="https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/assets/vedio/Background.mp4"
                    type="video/mp4">
            </video>
            <div id="title">
                <button @click="toggleNav" class="hamburgerMenu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <h1>SSE_MARKET</h1>
            </div>

            <div class="search">
                <input placeholder="在当前分区搜索" type="search" ref="sinfo" @keydown.enter="search">
                <button @click="search">搜索</button>
            </div>
        </header>
        <main>
            <div class="nav-bar main-nav-bar" v-if="isPC || navIsOpen" @click="toggleNav">
                <router-link class="nav" to="/" @click="changeTomain">主页</router-link>
                <router-link class="nav" to="/partitions" @send-partition="sendPartition">分区</router-link>
                <a href="javascript:;" class="nav" @click="changeToCourse">课程专区</a>
                <router-link class="nav" to="/post">发帖</router-link>
                <router-link class="nav" to="/notice">通知</router-link>
                <router-link class="nav" to="/feedback">反馈</router-link>
                <nav class="nav-bar second-nav-bar">
                    <router-link class="nav" to="/profile">个人信息</router-link>
                    <router-link class="nav" to="/save">我的收藏</router-link>
                    <router-link class="nav" to="/history">发帖历史</router-link>
                </nav>
                <router-link class="nav" to="/options">设置</router-link>
            </div>
            <div class="content" :style="contentStyle">
                <router-view v-if="route.fullPath != '/partitions'"></router-view>
                <router-view v-if="route.fullPath == '/partitions'" @send-partition="sendPartition"></router-view>
            </div>
            <div class="nav-bar heat" v-if="(!heatPostsIsHiden) && (isPC)">
                <h2>热榜</h2>
                <div class="nav" v-for="post in heatPosts" :key="post.PostID">
                    <span>{{ post.Title }}</span>
                </div>
            </div>
        </main>
    </div>
</template>
<style scoped>
header {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.search {
    height: 30px;
}

header input {
    height: 100%;
    border-radius: 15px;
    border: 1px solid black;
    background-color: #f0f0f06d;
    text-align: left;
    padding: 1%;
}

header button {
    height: 100%;
    border-radius: 15px;
    border: 1px solid black;
    background-color: #f0f0f06d;
    text-align: center;
}

main {
    width: 100%;
    padding: 0;
}

.main-nav-bar {
    padding: 0;
    border: 1px solid black;
    border-radius: 5px rgba(0, 0, 0, 0.1);
}

.second-nav-bar {
    width: 100%;
}

.nav-bar {
    display: flex;
    flex-direction: column;
    align-items: self-start;
}

.nav {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    padding: 15px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    text-align: center;
    text-decoration: none;
    color: black;
}

/* 大屏幕样式 >768px */
@media screen and (min-width: 768px) {
    .asideButton {
        display: none;
    }

    #root {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    header {
        height: 30vh;
        background-color: #f0f0f0;
        position: relative;
    }

    header button,
    header a {
        display: none;
    }

    header video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    header h1 {
        position: absolute;
        font-size: 3rem;
        color: transparent;
        -webkit-text-stroke: 3px rgb(235, 47, 182);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -75%);
    }

    .search {
        position: absolute;
        width: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, 50%);
    }

    header input {
        width: 95%;
    }

    header button {
        width: 5%;
    }

    header button:hover {
        background-color: #f0f0f0;
    }

    main {
        display: flex;
        flex-direction: row;
    }

    .main-nav-bar {
        margin-left: 2%;
        width: 20%;
    }

    body:not(:has(header)) .main-nav-bar {
        position: fixed;
    }

    .content {
        width: 45%;
        margin-left: 5%;
        margin-right: 5%;
        border: 1px solid black;
        border-radius: 5px;
    }

    .heat {
        text-align: center !important;
    }

    h2 {
        margin-left: auto;
        margin-right: auto;
        padding: 10px;
    }

    footer {
        display: none;
    }

    .nav:hover {
        background-color: #f0f0f0;
    }
}

/* 小屏幕样式 <768px */
@media screen and (max-width: 768px) {
    header {
        height: 20vh;
        margin: 0;
        flex-direction: column;
        background-color: rgba(136, 243, 255, 0.683);
    }

    #title {
        position: absolute;
        top: 0;
        display: flex;
        align-items: center;
        width: 100%;
        padding: 10px;
        /* 让button贴紧左边，h1居中 */
        justify-content: space-between;
        background-color: rgba(136, 243, 255, 0.683);
    }

    #title h1 {
        display: block;
        font-size: 2rem;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .search {
        width: 80%;
        margin: 0;
    }

    header input {
        width: 80%;
    }

    header button {
        width: 20%;
    }

    header video {
        display: none;
    }

    .hamburgerMenu {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        width: 30px;
        height: 30px;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        z-index: 9998;
        margin-left: 0;

    }

    .hamburgerMenu span {
        width: 100%;
        height: 3px;
        background-color: #333;
        border-radius: 2px;
        transition: all 0.3s;
        position: relative;
    }

    header a {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 2rem;
        color: white;
        text-decoration: none;
        border: 1px solid #333;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #333333e1;
        text-align: center;
    }

    main {
        margin: 0 !important;
        padding: 0;
    }

    .content {
        width: 100%;
        margin: 0;
        border: none;
    }

    .main-nav-bar {
        margin-left: 0;
        width: 80%;
        position: absolute;
        top: 5%;
    }

    .nav-bar {
        z-index: 9999;
        background-color: #f0f0f0;
    }

    .nav {
        z-index: 9998;
    }

    .heat {
        display: none;
    }
}
</style>
<script setup>
import { computed, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { getHeatPosts } from '@/utils/getPosts';
const route = useRoute()
const router = useRouter()
const partition = ref("主页")
provide('partition', partition)
const searchinfo = ref('')
provide('searchinfo', searchinfo)
const heatPosts = ref([])
const isPC = ref(true)
provide('isPC', isPC)
const heatPostsIsHiden = computed(() => {
    return /^\/post/.test(route.fullPath)
})
const contentStyle = ref({
    width: (!heatPostsIsHiden.value) && (isPC.value) ? '100%' : '45%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
})
const navIsOpen = ref(true)
const sinfo = ref(null)

const search = () => {
    searchinfo.value = sinfo.value.value
}
const changeTomain = () => {
    partition.value = "主页"
    searchinfo.value = ''
}
const changeToCourse = () => {
    partition.value = "课程专区"
    router.push('/')
}
const sendPartition = (p) => {
    partition.value = p
    console.log(partition.value)
}
const toggleNav = () => {
    if (!isPC.value) {
        navIsOpen.value = !navIsOpen.value
    }
}
onMounted(async () => {
    if (window.innerWidth < 768) {
        isPC.value = false
        navIsOpen.value = false
    }
    const posts = await getHeatPosts()
    heatPosts.value = posts
})
</script>