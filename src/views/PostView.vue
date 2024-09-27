<!-- eslint-disable vue/no-v-html -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
<template>
    <div class="root">
        <div class="inputData title">
            <h3>标题</h3>
            <input 
            ref="title" 
            type="text" 
            placeholder="请输入标题" 
            />
        </div>
        <div class="inputData post">
            <h3>正文</h3>
            <div class="editorButton">
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
            <div class="container">
                <textarea 
                v-model="postContent" 
                placeholder="请输入正文"
                @input="autoResize" 
                ></textarea>
                <div 
                id="content" 
                ref="mdContainer" 
                v-html="safeHTML(postContent)"
                ></div>
            </div>
        </div>
        <div class="inputData">
            <h3>图片上传</h3>
            <input 
            class="fileInput" 
            type="file" 
            accept="image/*" 
            @input="upload" 
            />
        </div>
        <div class="inputData">
            <h3>分区</h3>
            <select ref="partition">
                <option 
                v-for="p, index in partitions" 
                :key="index" 
                :value="p"
                >
                {{ p }}
            </option>
            </select>
        </div>
        <div class="inputData">
            <button 
            @click="submitPost"
            >
            发布
        </button>
        </div>
    </div>
</template>

<script setup>
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';
import { ref, inject } from 'vue';
import { showMsg } from '@/utils/msgbox';

import { sendPost, uploadPhoto } from '@/utils/postAndComment'
const userInfo = inject('userInfo')
const partitions = ref(['主页', '日常吐槽', '打听求助', '恋爱交友', '学习交流', '二手闲置', '求职招募', '其他'])
const postContent = ref('')
const title = ref(null)
const partition = ref(null)
const tagList = ref('')
const mdContainer = ref(null)

const autoResize = (event) => {
    event.target.style.height = '100px';
    event.target.style.height = event.target.scrollHeight + 'px';
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
            child.style.wordBreak = 'break-all'
            child.style.overflowWrap = 'break-word'
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

const submitPost = async () => {
    const postTitle = title.value.value
    const content = postContent.value
    const postPartition = partition.value.value

    if (!postTitle || !content) {
        alert('请填写完整信息')
        return
    }
    const res = await sendPost(content, postPartition, '', tagList.value, postTitle, userInfo.value.phone)
    showMsg(res.msg)
}

const upload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        const data = await uploadPhoto(file);
        console.log(data)
        showMsg(data.message);
        // postContent.value += `![${file.name}](${data.fileURL})`;
        postContent.value += `<img src="${data.fileURL}" alt="${file.name}" />`;
    } else {
        console.error('No file selected');
    }
}

const editComment = (type) => {
    switch (type) {
        case '标题':
            postContent.value += '### 标题'
            break
        case '粗体':
            postContent.value += '**粗体**'
            break
        case '斜体':
            postContent.value += '*斜体*'
            break
        case '删除线':
            postContent.value += '~~删除线~~'
            break
        case '引用':
            postContent.value += '> 引用'
            break
        case '无序列表':
            postContent.value += '- 无序列表'
            break
        case '有序列表':
            postContent.value += '1. 有序列表'
            break
        case '表格':
            postContent.value += '| 表头1 | 表头2 |\n| --- | --- |\n| 内容1 | 内容2 |'
            break
        case '分割线':
            postContent.value += '---'
            break
        case '代码块':
            postContent.value += '```language\n代码块\n```'
            break
        default:
            break
    }
}
</script>

<style scoped>
@import "../assets/hl.css";

.root {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    width: 100%;
    height: auto;
}

.title {
    margin-top: 10%;
    top: 0;
}

.inputData {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 10px;
    border-radius: 5px;
}

.post {
    height: auto;
    min-height: 60%;
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: auto;
    margin-top: 0;
}

.post>* {
    flex-shrink: 0;
}

.container {
    display: flex;
    flex-direction: row;
    /* align-items: center; */
    justify-content: center;
    width: 100%;
    height: auto;
}

.container textarea,
.container div {
    width: 100%;
    min-height: 100%;
    border-radius: 5px;
    padding: 10px;
    height: auto;
    overflow-y: hidden;
}

.container textarea {
    height: 100px;
}
</style>
