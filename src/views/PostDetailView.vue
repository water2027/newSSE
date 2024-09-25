<template>
  <div class="root">
    <div class="postDetail">
      <div class="user">
        <img v-if="post.UserAvatar" :src="post.UserAvatar">
        <span>{{ post.UserName }}</span>
      </div>
      <h2>{{ post.Title }}</h2>
      <div id="content" :style="mdContainerStyle" ref="mdContainer" v-html="safeHTML(post.Content)">
      </div>
      <div class="imgs" v-if="post.Photos">
        <!-- 图片路径由|分割 -->
        <img v-for="img in strHandler('img', post.Photos)" :src="img" :key="img">
      </div>
      <span>{{ strHandler("time", post.PostTime) }}</span>
      <div class="postInfo">
        <span>{{ post.Browse }}<svg data-v-350ab42a="" viewBox="0 0 16 16" width="1em" height="1em" focusable="false"
            role="img" aria-label="eye fill" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <g>
              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"></path>
              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z">
              </path>
            </g>
          </svg></span>
        <span>{{ post.Like }}<svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img"
            aria-label="heart" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="heart">
            <g>
              <path
                d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z">
              </path>
            </g>
          </svg></span>
        <span>{{ post.Comment }}<svg data-v-350ab42a="" viewBox="0 0 16 16" width="1em" height="1em" focusable="false"
            role="img" aria-label="chat dots fill" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <g>
              <path
                d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z">
              </path>
            </g>
          </svg></span>
      </div>
    </div>
    <div class="comment">
      <h2>评论</h2>
      <div class="commentList">
        <div class="commentItem" v-for="comment in comments" :key="comment.PcommentID">
          <div class="user">
            <img v-if="comment.AuthorAvatar" :src="comment.AuthorAvatar">
            <span>{{ comment.Author }}</span>
          </div>
          <span>{{ comment.Content }}</span>
          <span>{{ strHandler("time", comment.CommentTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
@import "../assets/hl.css";
.comment {
  margin-top: 20px;
  height: auto;
}
.commentItem{
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-bottom:10px;
  border: 1px solid #f0f0f0;
  
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
}

.postInfo {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}
</style>
<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPostByID, getCommentsByPostID } from '@/utils/getPosts';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';
const route = useRoute()

const posts = inject('posts') || ref([])
const userInfo = inject('userInfo')
const isPC = inject('isPC')

const post = ref({})
const comments = ref([])
const mdContainer = ref(null)
const mdContainerStyle = computed(() => {
  return {
    width: '100%',
    height: 'auto',
    margin: '10px 0',
    fontSize: isPC ? '23px' : '12px',
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
    const childElements = mdContainer.value.querySelectorAll('*')
    childElements.forEach((child) => {
      child.style.whiteSpace = 'pre-wrap'
    })
  }, 0)
  return finalHTML;
}

const highlightcode = () => {
  const blocks = mdContainer.value.querySelectorAll('pre code'); // 使用 refs 获取元素
  blocks.forEach((block) => {
    hljs.highlightElement(block); // 高亮每个代码块
  })
}

onMounted(async () => {
  if (posts.value.length) {
    post.value = posts.value.find(post => post.id === route.params.id)
  } else {
    const curPost = await getPostByID(Number(route.params.id), userInfo.value.phone)
    const curComments = await getCommentsByPostID(Number(route.params.id),userInfo.value.phone)
    post.value = curPost
    comments.value = curComments
    console.log(curComments)
  }
})
</script>