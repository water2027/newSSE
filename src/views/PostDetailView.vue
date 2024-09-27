<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/no-v-html -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
<template>
    <div ref="root" class="root" @click="copyCode">
        <div class="postDetail">
            <div class="user">
                <img v-if="post.UserAvatar" :src="post.UserAvatar">
                <span>{{ post.UserName }}</span>
            </div>
            <h2>{{ post.Title }}</h2>
            <div 
            id="content" ref="mdContainer" class="hasImgDiv" :style="mdContainerStyle"
                v-html="safeHTML(post.Content)"
                ></div>
            <div v-if="post.Photos" class="imgs">
                <!-- 图片路径由|分割 -->
                <img v-for="img in strHandler('img', post.Photos)" :key="img" :src="img">
            </div>
            <span>{{ strHandler("time", post.PostTime) }}</span>
            <div class="postInfo">
                <span>{{ post.Browse }}
                    <svg 
                    viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img"
                        aria-label="eye fill" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                        >
                        <g>
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                            <path
                                d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" 
                                />
                        </g>
                    </svg></span>
                <span>{{ post.Like }}
                    <svg 
                    viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="heart"
                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="heart"
                        >
                        <g>
                            <path
                                d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" 
                                />
                        </g>
                    </svg></span>
                <span>{{ post.Comment }}
                    <svg 
                    viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img"
                        aria-label="chat dots fill" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                        >
                        <g>
                            <path
                                d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                                />
                        </g>
                    </svg></span>
            </div>
        </div>
        <div class="comment">
            <h2>评论</h2>
            <div class="commentButton">
                <button @click="commentButtonIsShow = !commentButtonIsShow">
                    {{ commentButtonIsShow ? '隐藏' : '发评论' }}
                    </button>
                <button 
                v-if="commentButtonIsShow"
                @click="send" 
                >
                发送
            </button>
                <input 
                v-if="commentButtonIsShow" 
                class="fileInput" 
                type="file" 
                @input="upload"
                >
            </div>
            <div 
            v-if="commentButtonIsShow"
            class="editorButton" 
            >
                <button @click="editComment('标题')">
                    标题
                </button>
                <button @click="editComment('粗体')">
                    粗体
                </button>
                <button @click="editComment('斜体')">
                    斜体
                </button>
                <button @click="editComment('删除线')">
                    删除线
                </button>
                <button @click="editComment('引用')">
                    引用
                </button>
                <button @click="editComment('无序列表')">
                    无序列表
                </button>
                <button @click="editComment('有序列表')">
                    有序列表
                </button>
                <button @click="editComment('表格')">
                    表格
                </button>
                <button @click="editComment('分割线')">
                    分割线
                </button>
                <button @click="editComment('代码块')">
                    代码块
                </button>
            </div>
            <div 
            v-if="commentButtonIsShow"
            id="mdEditorContainer" 
            >
                <textarea 
                v-model="commentContent" 
                placeholder="请输入正文"
                @input="autoResize" 
                ></textarea>
                <div ref="mdEditorContainer" v-html="safeHTML(commentContent)"></div>
            </div>
            <div class="commentList">
                <div v-for="comment in comments" :key="comment.PcommentID" class="commentItem">
                    <div class="user">
                        <img v-if="comment.AuthorAvatar" :src="comment.AuthorAvatar">
                        <span>{{ comment.Author }}</span>
                    </div>
                    <div class="hasImgDiv" v-html="safeHTML(comment.Content)"></div>
                    <span>{{ strHandler("time", comment.CommentTime) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPostByID, getCommentsByPostID } from '@/utils/getPosts';
import { sendComment, uploadPhoto } from '@/utils/postAndComment';

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';
import { showMsg } from '@/utils/msgbox';
const route = useRoute()

const posts = inject('posts') || ref([])
const userInfo = inject('userInfo')
const isPC = inject('isPC')
const commentContent = ref('')

const post = ref({})
const comments = ref([])
const commentButtonIsShow = ref(false)
const root = ref(null)
const mdContainerStyle = computed(() => {
    return {
        width: '100%',
        height: 'auto',
        margin: '10px 0',
        fontSize: isPC.value ? '23px' : '23px',
        paddingLeft: '1%',
        paddingBottom: '5%',
        marginBottom: '1%',
    }
})
/**
 * 
 * @param  type {string}
 * @param  str {string}
 */
const strHandler = (type, str) => {
    if (!str) return ''
    switch (type) {
        case 'img':
            return str.split('|')
        case 'time':
            return str.replace('T', ' ').split('+')[0]
        default:
            return str
    }
}

const safeHTML = (str) => {
    if (!str) {
        return
    }
    marked.setOptions(
        {
            renderer: new marked.Renderer(),
            pedantic: false,
            gfm: true,
            breaks: true,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false,
        },
    );
    const target = marked(str);
    const finalHTML = DOMPurify.sanitize(target);
    setTimeout(() => {
        highlightcode()
        const childElements = root.value.querySelectorAll('*')
        childElements.forEach((child) => {
            child.style.whiteSpace = 'pre-wrap'
        })
    }, 0)
    return finalHTML;
}

const highlightcode = () => {
    const blocks = root.value.querySelectorAll('pre code'); // 使用 refs 获取元素
    blocks.forEach((block) => {
        hljs.highlightElement(block); // 高亮每个代码块
    })
}

const autoResize = (event) => {
    event.target.style.height = '100px';
    event.target.style.height = event.target.scrollHeight + 'px';
}

const editComment = (type) => {
    switch (type) {
        case '标题':
            commentContent.value += '### 标题'
            break
        case '粗体':
            commentContent.value += '**粗体**'
            break
        case '斜体':
            commentContent.value += '*斜体*'
            break
        case '删除线':
            commentContent.value += '~~删除线~~'
            break
        case '引用':
            commentContent.value += '> 引用'
            break
        case '无序列表':
            commentContent.value += '- 无序列表'
            break
        case '有序列表':
            commentContent.value += '1. 有序列表'
            break
        case '表格':
            commentContent.value += '| 表头1 | 表头2 |\n| --- | --- |\n| 内容1 | 内容2 |'
            break
        case '分割线':
            commentContent.value += '---'
            break
        case '代码块':
            commentContent.value += '```language\n代码块\n```'
            break
        default:
            break
    }
}

const send = async () => {
    const res = await sendComment(commentContent.value, Number(route.params.id), userInfo.value.phone)
    if (res) {
        getCommentsByPostID(Number(route.params.id), userInfo.value.phone).then(res => {
            comments.value = res
            showMsg('评论成功')
        })
    }
}

const upload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        const data = await uploadPhoto(file);
        showMsg(data.message);
        // commentContent.value += `![${file.name}](${data.fileURL})`;
        commentContent.value += `<img src="${data.fileURL}" alt="${file.name}" />`;
    } else {
        console.error('No file selected');
    }
}

const copyCode = async (event) => {
    if (event.target.tagName === 'PRE') {
        const code = event.target.innerText
        await navigator.clipboard.writeText(code)
        showMsg('代码已复制')
    }
}

onMounted(async () => {
    if (posts.value.length) {
        post.value = posts.value.find(post => post.id === route.params.id)
    } else {
        const curPost = await getPostByID(Number(route.params.id), userInfo.value.phone)
        const curComments = await getCommentsByPostID(Number(route.params.id), userInfo.value.phone)
        post.value = curPost
        comments.value = curComments
    }
})
</script>
<style scoped>
@import "../assets/hl.css";

.root {
    display: flex;
    flex-direction: column;
    padding: 1%;
    width: 100%;
}

.comment {
    margin-top: 20px;
    height: auto;
}

.commentItem {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    margin-bottom: 10px;
    border: 1px solid #f0f0f0;
}

:deep(pre) {
    display: block;
    background-color: #f4f4f4;
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 5px;
    position: relative;
    overflow: auto;
    pointer-events: none;
    white-space: pre-wrap;
}

:deep(pre::before) {
    content: '';
    background-image: url('https://img.icons8.com/?size=100&id=86206&format=png&color=000000');
    background-size: cover;
    display: block;
    width: 20px;
    height: 20px;
    position: absolute;
    z-index: 10;
    top: 3px;
    right: 3px;
    pointer-events: auto;
    /* 确保伪元素可以接收鼠标事件 */
}

.commentButton {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}

.editorButton {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
}

@media screen and (min-width: 768px) {
    .user {
        --userImage: 50px;
        width: 100%;
        height: 30px;
        /* 靠左 */
        margin-right: auto;
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
        margin-top: 10px;
    }

    .user img {
        width: var(--userImage);
        height: var(--userImage);
        border-radius: 50%;
    }

    .user .b-avatar {
        width: calc(var(--userImage) + 10px);
        height: calc(var(--userImage) + 10px);
        margin-right: 0.5rem;
        background-color: #6c757d;
        color: #fff;
        border-radius: 50%;
    }

    .postDetail {
        width: 100%;
        margin-left: 0;
        margin-right: auto;
        padding: 1%;
        border-radius: 5px;
        box-sizing: border-box;
    }
}

@media screen and (max-width: 768px) {
    .user {
        --userImage: 50px;
        width: 100%;
        height: 30px;
        /* 靠左 */
        margin-right: auto;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
    }

    .user img {
        width: var(--userImage);
        height: var(--userImage);
        border-radius: 50%;
    }

    .user .b-avatar {
        width: calc(var(--userImage) + 10px);
        height: calc(var(--userImage) + 10px);
        margin-right: 0.5rem;
        background-color: #6c757d;
        color: #fff;
        border-radius: 50%;
    }

    .commentButton {
        width: 100%;
        display: grid !important;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
    }

    .commentButton> :nth-child(1) {
        grid-column: 1;
        grid-row: 1;
    }

    .commentButton> :nth-child(2) {
        grid-column: 2;
        grid-row: 1;
    }

    .commentButton> :nth-child(3) {
        grid-column: 1 / span 2;
        grid-row: 2;
    }

    :deep(.hasImgDiv img) {
        width: 100vw;
        height: auto;
        margin: 10px 0;
        font-size: 23px;
        margin-bottom: 1%;
    }

    .hasImgDiv img {
        width: 100vw;
        height: auto;
        margin: 10px 0;
        font-size: 23px;
        margin-bottom: 1%;
    }
}

.postInfo {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
}

#mdEditorContainer {
    display: flex;
    flex-direction: row;
    /* align-items: center; */
    justify-content: center;
    width: 100%;
    height: auto;
}

#mdEditorContainer textarea,
#mdEditorContainer div {
    width: 100%;
    height: 100px;
    border-radius: 5px;
    padding: 10px;
    height: auto;
    overflow-y: hidden;
}

#mdEditorContainer textarea {
    height: 100px;
}
</style>