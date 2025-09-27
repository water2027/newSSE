<!-- eslint-disable vue/html-self-closing -->
<script setup lang="ts">
import type { Tag } from '@/api/info/getTeacher'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

import { useRouter } from 'vue-router'
import { sendPost } from '@/api/editPostAndComment/editPost'
import { getTeachers } from '@/api/info/getTeacher'

import MarkdownEditor from '@/components/MarkdownEditor.vue'
import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'
import { useDraft } from '@/composables/useDraft'
import type { Draft } from '@/composables/useDraft'

const router = useRouter()
const { userInfo } = useUserStore()
const { current, drafts, addDraft, selectDraft, deleteDraft, updateDraft } = useDraft()
const partitions = ref([
  '主页',
  '日常吐槽',
  '打听求助',
  '学习交流',
  '院务',
  '课程专区',
  '求职招募',
  '其他',
])
const postContent = ref('')
const title = useTemplateRef('title')
const partition = ref('主页')

const teachers = ref<Tag[]>([])
// 好抽象的命名，完全想不到老师居然是作为tagList传过去的
const teacher = ref('')

const currentDraftId = ref<number | null>(null)
let autoSaveTimer: number | null = null

async function loadDraft(id: number) {
  selectDraft(id)
  if (title.value)
    title.value.value = current.title
  postContent.value = current.content
}

async function removeDraft(id: number) {
  if (!id) {
    return
  }
  await deleteDraft(id)
  showMsg('草稿已删除')
}

async function saveDraft() {
  const draftTitle = title.value?.value || ''
  const draftContent = postContent.value

  if (!draftTitle && !draftContent) {
    showMsg('请输入标题或内容')
    return
  }

  const newDraftId = await addDraft({ title: draftTitle, content: draftContent }) as unknown as number
  selectDraft(newDraftId)
  showMsg('草稿已保存')
}

function autoSaveDraft() {
  if (!current.id) {
    return Promise.resolve(false)
  }
  const draftTitle = title.value?.value || ''
  const draftContent = postContent.value

  if (draftTitle || draftContent) {
    return updateDraft({ id: current.id, title: draftTitle, content: draftContent })
    .then(() => {
      return true
    })
  }
  return Promise.resolve(false)
}

function discardDraft() {
  current.content = ''
  current.title = ''
  current.id = 0
}

async function submitPost() {
  if (!title.value)
    return
  let postTitle = title.value.value
  const content = postContent.value
  const postPartition = partition.value
  // 去除标题的空格
  postTitle = postTitle.replace(/(^\s*)|(\s*$)/g, '')

  if (!postTitle || !content) {
    showMsg('请填写完整信息')
    return
  }
  const res = await sendPost(
    content,
    postPartition,
    '',
    teacher.value,
    postTitle,
    userInfo.phone,
  )
  router.push('/')
  showMsg(res.msg)
}

onMounted(async () => {
  const data = await getTeachers()
  teachers.value = data

  // 启动自动保存，每30秒保存一次
  autoSaveTimer = setInterval(() => {
    autoSaveDraft()
    .then((saved) => {
      if (saved) {
        showMsg('草稿已自动保存')
      }
    })
  }, 30000)
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})
</script>

<template>
  <div class="root">
    <div class="main-content">
      <div class="title inputData">
        <h3>标题</h3>
        <input
          ref="title"
          type="text"
          placeholder="请输入标题"
        >
      </div>
      <div class="inputData">
        <h3>分区</h3>
        <select v-model="partition">
          <option
            v-for="(p, index) in partitions"
            :key="index"
            :value="p"
          >
            {{ p }}
          </option>
        </select>
        <select
          v-if="partition === '课程专区'"
          v-model="teacher"
        >
          <option
            v-for="t in teachers"
            :key="t.TagID"
            :value="t.Name"
          >
            {{ t.Name }}
          </option>
        </select>
      </div>
      <div class="inputData post">
        <h3>正文</h3>
        <MarkdownEditor
          v-model="postContent"
          @send="submitPost"
        />
      </div>
    </div>
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>草稿</h3>
        <button @click="discardDraft" class="save-btn">不用草稿</button>
        <button @click="autoSaveDraft" class="save-btn">更新</button>
        <button @click="saveDraft" class="save-btn">保存</button>
      </div>
      <div v-if="drafts.length === 0" class="no-drafts">
        暂无草稿
      </div>
      <div v-else class="draft-list">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="draft-item"
          :class="{ active: draft.id === current.id }"
        >
          <div class="draft-header">
            <h4 @click="loadDraft(draft.id!)">{{ draft.title || '无标题' }}</h4>
            <button @click="removeDraft(draft.id!)" class="delete-btn">删除</button>
          </div>
          <p @click="loadDraft(draft.id!)">{{ draft.content.slice(0, 10) }}...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  height: auto;
  width: 100%;
  color: var(--color-text);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.sidebar {
  width: 300px;
  padding: 20px;
  border-left: 1px solid var(--color-border);
  height: 100vh;
  overflow-y: auto;
  background-color: var(--color-background);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.save-btn {
  padding: 5px 10px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: var(--color-primary-hover);
}

.title {
  margin-top: 100px;
  top: 0;
}

.inputData {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto;
  padding: 10px;
  border-radius: 5px;
}

.post {
  height: auto;
  min-height: 80%;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  margin-top: 0;
}

.post > * {
  flex-shrink: 0;
}

option {
  font-size: 1.2rem;
}
select {
  width: 25%;
  height: 30px;
  border-radius: 5px;
}

.title input {
  width: 25%;
  height: 30px;
  border-radius: 5px;
  padding: 5px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 768px) {
  .root {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid var(--color-border);
  }
  .title {
    margin-top: 10px;
  }
}

.draft-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.draft-item {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.draft-item:hover {
  background-color: var(--color-hover);
}

.draft-item h4 {
  margin: 0 0 5px 0;
  font-size: 1rem;
}

.draft-item p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-size: 0.8rem;
}

.delete-btn:hover {
  text-decoration: underline;
}

.no-drafts {
  text-align: center;
  color: var(--color-text-secondary);
}

.active {
  background-color: var(--color-active);
}
</style>
