<template>
    <div id="root">
        <header>
            <img src="../assets/wow.jpg" alt="">
            <span>SSE_MARKET</span>
            <div class="search">
                <input type="search">
                <button @click="search">搜索</button>
            </div>
            <button @click="toggleNav" class="hamburgerMenu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <router-link to="/post">+</router-link>
        </header>
        <main>
            <div class="nav-bar main-nav-bar" v-if="isMobileAndNavOpen">
                <router-link class="nav" to="/">主页</router-link>
                <router-link class="nav" to="/partitions">分区</router-link>
                <router-link class="nav" to="/course">课程专区</router-link>
                <router-link class="nav" to="/postDetail">发帖</router-link>
                <router-link class="nav" to="/notice">通知</router-link>
                <router-link class="nav" to="/feedback">反馈</router-link>
                <a class="nav" href="javascript:;">我的</a>
                <nav class="nav-bar second-nav-bar">
                    <router-link class="nav" to="/profile">个人信息</router-link>
                    <router-link class="nav" to="/save">我的收藏</router-link>
                    <router-link class="nav" to="/history">发帖历史</router-link>
                </nav>
                <router-link class="nav" to="/postEdit">设置</router-link>
            </div>
            <div class="content">
                <router-view></router-view>
            </div>
            <div class="nav-bar heat">
                <h2>热榜</h2>
                <div class="nav" v-for="post in heatPosts" :key="post.PostID">
                    <span>{{ post.Title }}</span>
                </div>
            </div>
        </main>
    </div>
</template>
<style scoped>
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
        width: 100%;
        height: 30vh;
        background-color: #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    header button {
        display: none;
    }

    header a {
        display: none;
    }

    header img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    header span {
        position: absolute;
        font-size: 3rem;
        color: white;
        font-weight: bold;
        /* 改成透明的 */
        color: transparent;
        /* 字有边框 */
        -webkit-text-stroke: 3px rgb(235, 47, 182);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -75%);
    }

    .search {
        position: absolute;
        width: 50%;
        height: 30px;
        border-radius: 15px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, 50%);
    }

    header input {
        width: 95%;
        height: 100%;
        border-radius: 15px;
        border: 1px solid black;
        background-color: #f0f0f06d;
        text-align: left;
    }

    header button {
        width: 5%;
        height: 100%;
        border-radius: 15px;
        border: 1px solid black;
        background-color: #f0f0f06d;
        text-align: center;
    }

    header button:hover {
        background-color: #f0f0f0;
    }

    main {
        width: 100%;
        display: flex;
        flex-direction: row;
    }

    .main-nav-bar {
        margin-left: 2%;
        width: 20%;
        padding: 0;
        border: 1px solid black;
        border-radius: 5px rgba(0, 0, 0, 0.1)
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

    .nav:hover {
        background-color: #f0f0f0;
    }

    .content {
        width: 45%;
        margin-left: 5%;
        margin-right: 5%;
        border: 1px solid black;
        border-radius: 5px;
    }

    .heat {
        /* 文字居中 */
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

}

@media screen and (max-width: 768px) {
    header {
        width: 100%;
        height: 20vh;
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: rgba(136, 243, 255, 0.683);
    }

    header span {
        display: block;
        font-size: 2rem;
        text-align: center;
        position: relative;
    }

    .search {
        width: 80%;
        height: 30px;
        margin: 0;
    }

    header input {
        width: 80%;
        height: 100%;
        border-radius: 15px;
        border: 1px solid black;
        background-color: #f0f0f06d;
        text-align: left;
    }

    header button {
        width: 20%;
        height: 100%;
        border-radius: 15px;
        border: 1px solid black;
        background-color: #f0f0f06d;
        text-align: center;
    }

    header img {
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
        position: absolute;
        top: 10px;
        left: 10px;
    }

    .hamburgerMenu span {
        width: 100%;
        height: 3px;
        background-color: #333;
        border-radius: 2px;
        transition: all 0.3s;
    }

    header a{
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 2rem;
        color: #333;
        text-decoration: none;
        border: 1px solid #333;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        background-color: #333333e1;
        text-align: center;
    }

    main {
        width: 100%;
        margin: 0;
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
        padding: 0;
        border: 1px solid black;
        border-radius: 5px rgba(0, 0, 0, 0.1);
        position: absolute;
        top: 5%;
    }

    .second-nav-bar {
        width: 100%;
    }

    .nav-bar {
        display: flex;
        flex-direction: column;
        align-items: self-start;
        z-index: 9999;
        background-color: #f0f0f0;
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
        z-index: 9998;
    }

    .heat {
        display: none;
    }
}
</style>
<script setup>
import { onMounted, ref } from 'vue'
const heatPosts = ref([])
const isMobileAndNavOpen = ref(true)
const toggleNav = () => {
    isMobileAndNavOpen.value = !isMobileAndNavOpen.value
}
onMounted(async () => {
    if(window.innerWidth < 768) {
        isMobileAndNavOpen.value = false
    }
    const posts = await fetch('/auth/calculateHeat', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        return res.json()
    })
    heatPosts.value = posts
})
</script>