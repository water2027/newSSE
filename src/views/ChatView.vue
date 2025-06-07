<script setup lang="ts">
import type { AllInfo } from '@/api/info/getInfo'
import { Icon } from '@iconify/vue'
import { inject, nextTick, onBeforeMount, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { getChatHistory } from '@/api/chat/chat'
import { getInfoById } from '@/api/info/getInfo'
import { showMsg } from '@/components/MessageBox'
import UserAvatar from '@/components/UserAvatar.vue'
import { useUserStore } from '@/store/userStore'

export interface Message {
  senderUserID: number
  targetUserID: number
  content: string
  chatMsgID: number
  createdAt: number
}

const route = useRoute()
const { userInfo, token } = useUserStore()

const draft = ref('')
type Contact = AllInfo & { unRead: number }
const current = ref<Contact>({
  avatarURL: '',
  ban: '',
  email: '',
  intro: '',
  name: '',
  phone: '',
  punishnum: 0,
  score: 0,
  userID: 0,
  emailpush: false,
  unRead: 0,
})
const contacts = ref<Contact[]>([])
const messages = ref<Message[]>([])

const historyDiv = useTemplateRef<HTMLDivElement>('historyDiv')
const updateChatNum = inject('updateChatNum') as (num?: number) => void

let ws: WebSocket
const preDataFetch: any[] = []
let dummyID = 100000000

onBeforeMount(() => {
  const reqId = route.query.user
  if (reqId) {
    if (Number(reqId) !== userInfo.userID) {
      preDataFetch.push(
        getInfoById(Number(reqId))
          .then((res) => {
            contacts.value.splice(0, 0, convertChatUser(res))
            dedupContacts()
          })
          .catch((error) => {
            if (error.response) {
              const res = error.response
              toastError(`请求无效：${res.msg} (${res.code})`)
              console.error(res)
            }
          }),
      )
    }
    else {
      toastError('不能给自己发消息哦！')
    }
  }

  keepConnection()
  setInterval(keepConnection, 30000)
})

onMounted(() => {
  Promise.all(preDataFetch).then(() => selectContact(contacts.value[0]))
  updateChatNum(0)
})

onUnmounted(() => {
  updateChatNum()
})

function getDummyID() {
  dummyID += 1
  return dummyID
}

function toastError(content: string) {
  showMsg(`内部错误：${content}`)
}

function toastInfo(content: string) {
  showMsg(`私信系统：${content}`)
}

function handleDraftKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && event.ctrlKey) {
    sendMessage()
    event.stopPropagation()
  }
}

function selectContact(sel: Contact) {
  if (!current.value || !sel || sel.userID === current.value.userID)
    return

  draft.value = ''
  current.value = sel
  current.value.unRead = 0
  messages.value = []

  updateChatHistory(() => scrollHistory())
}

function scrollHistory() {
  nextTick(() => {
    const el = historyDiv.value
    if (!el)
      return
    historyDiv.value.scrollTop = historyDiv.value.scrollHeight
  })
}

function sendMessage() {
  if (draft.value !== '') {
    if (!current.value)
      return
    const message: Message = {
      senderUserID: userInfo.userID,
      targetUserID: current.value.userID,
      content: draft.value,
      chatMsgID: 0,
      createdAt: Date.now(),
    }

    if (sendWsMessage(JSON.stringify(message))) {
      draft.value = ''

      message.chatMsgID = getDummyID()
      messages.value.push(message)

      scrollHistory()
    }
    else {
      toastError('消息发送失败（服务器未连接）')
    }
  }
}

function dedupContacts() {
  const seen = new Set()
  contacts.value = contacts.value.reduce((acc: Contact[], current) => {
    const keyValue = current.userID
    if (!seen.has(keyValue)) {
      seen.add(keyValue)
      acc.push(current)
    }
    return acc
  }, [])
}

function handleSocketMessage(event: MessageEvent<any>) {
  let data
  try {
    data = JSON.parse(event.data)
  }
  catch (e) {
    toastError('服务器响应无效')
    console.error(e)
    return
  }
  if (data.relevantUsers) {
    contacts.value.push(...data.relevantUsers)
    dedupContacts()
  }
  else if (data.chatMsgID) {
    if (data.targetUserID === userInfo.userID) {
      if (data.senderUserID === current.value?.userID) {
        messages.value.push(data)
        const el = historyDiv.value
        if (!el)
          return
        if (el.scrollTop + el.clientHeight - el.scrollHeight > -1) {
          scrollHistory()
        }
      }
      else {
        const idx = contacts.value.findIndex(it => it.userID === data.senderUserID)
        if (idx !== -1) {
          const contact = contacts.value[idx]
          contact.unRead += 1
          contacts.value.splice(idx, 1)
          contacts.value.splice(0, 0, contact)
        }
        else {
          getInfoById(data.senderUserID).then((res) => {
            contacts.value.splice(0, 0, convertChatUser(res, 1))
          })
        }
      }
    }
  }
  else if (data.code) {
    if (data.code === 0) {
      toastError(`请求失败：${data.msg} (${data.code})`)
      console.error(data)
    }
  }
}

function convertChatUser(user: AllInfo, unRead: number = 0) {
  return {
    ...user,
    intro: user.intro || '未设置签名',
    unRead,
  }
}

function connectWebSocket() {
  // connect websocket
  const wsURL = new URL('/websocket/auth/chat', import.meta.env.VITE_API_BASE_URL)
  wsURL.searchParams.append('token', token.value)
  ws = new WebSocket(wsURL)
  ws.addEventListener('close', () => {
    setTimeout(() => {
      keepConnection()
    }, 5000)
    toastError('服务器断开连接')
  })
  ws.addEventListener('open', () => toastInfo('已连接到服务器'))
  ws.addEventListener('message', handleSocketMessage)
}

function keepConnection() {
  const state = ws ? ws.readyState : WebSocket.CLOSED
  if (state === WebSocket.OPEN) {
    ws.send(JSON.stringify({ userID: userInfo.userID, beat: 1 }))
  }
  else if (state === WebSocket.CLOSED) {
    connectWebSocket()
  }
}

function sendWsMessage(message: string) {
  const state = ws ? ws.readyState : WebSocket.CLOSED
  if (state === WebSocket.OPEN) {
    ws.send(message)
    return true
  }
  return false
}

function updateChatHistory(callback: () => void) {
  getChatHistory(userInfo.userID, current.value.userID)
    .then((res) => {
      if (res.code === 200) {
        messages.value = []
        messages.value.push(...res.data.chatHistoryList)
        callback()
      }
    })
    .catch((error) => {
      if (error.response) {
        const res = error.response
        toastError(`聊天记录获取失败：${res.msg} (${res.code})`)
        console.error(res)
      }
    })
}

function getTimeShow(idx: number) {
  if (idx === 0) {
    const date = new Date(messages.value[0].createdAt)
    const str = date.toLocaleString()
    return str.substring(0, str.length - 3) // yyyy-MM-dd HH:mm
  }

  const prev = new Date(messages.value[idx - 1].createdAt)
  const date = new Date(messages.value[idx].createdAt)
  if (!checkSameDay(prev, date)) {
    if (prev.getFullYear() === date.getFullYear()) {
      const str = date.toLocaleString()
      return str.substring(5, str.length - 3) // MM-dd HH:mm
    }
    const str = date.toLocaleString()
    return str.substring(0, str.length - 3) // yyyy-MM-dd HH:mm
  }
  if (date.getTime() - prev.getTime() > 300000) {
    const str = date.toLocaleTimeString()
    return str.substring(0, str.length - 3) // HH:mm
  }
  return null
}

function checkSameDay(x: Date, y: Date) {
  return (
    x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDay() === y.getDay()
  )
}
</script>

<template>
  <div class="chat-wrapper">
    <div :class="current.userID ? 'contact-list' : 'contact-list2'">
      <div class="contact-header">
        <Icon icon="tabler:send" />
        对话列表
      </div>
      <div class="lite-scrollbar">
        <div
          v-for="entry in contacts" :key="entry.userID"
          class="contact-entry" :class="[current.userID === entry.userID && 'selected']" @click="selectContact(entry)"
        >
          <UserAvatar class="contact-icon" :src="entry.avatarURL" :alt="entry.name" />
          <div class="contact-info">
            <div class="contact-name">
              {{ entry.name }}
            </div>
            <div class="contact-intro">
              <div v-if="entry.unRead" class="contact-unread">
                {{ entry.unRead > 99 ? '99+' : entry.unRead }}
              </div>
              {{ entry.intro }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main">
      <div class="message-panel">
        <template v-if="current.userID">
          <div class="message-header">
            <div class="contact-entry selected">
              <UserAvatar class="contact-icon" :src="current.avatarURL" :alt="current.name" />
              <div class="contact-info">
                <div :class="current.userID ? 'contact-name' : 'contact-name2'">
                  {{ current.name }}
                </div>
                <div class="contact-intro">
                  {{ current.intro }}
                </div>
              </div>
            </div>
          </div>
          <div ref="historyDiv" class="lite-scrollbar message-history">
            <div v-for="(entry, i) in messages" :key="entry.chatMsgID">
              <div v-if="getTimeShow(i)" class="message-time">
                <div>
                  {{ getTimeShow(i) }}
                </div>
              </div>
              <div class="message-entry" :class="[entry.senderUserID === userInfo.userID && 'reversed']">
                <template v-if="entry.senderUserID === userInfo.userID">
                  <UserAvatar class="contact-icon" :src="userInfo.avatarURL" :alt="userInfo.name" />
                  <div class="message-info">
                    <div class="message-sender">
                      {{ userInfo.name }}
                    </div>
                    <div class="message-body">
                      {{ entry.content }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <UserAvatar class="contact-icon" :src="current.avatarURL" :alt="current.name" />
                  <div class="message-info">
                    <div class="message-sender">
                      {{ current.name }}
                    </div>
                    <div class="message-body">
                      {{ entry.content }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="message-footer">
            <textarea
              v-model="draft" placeholder="输入信息..." rows="4" class="lite-scrollbar message-input"
              @keydown="handleDraftKeyDown"
            />
            <div class="message-send" @click="sendMessage">
              发送
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-wrapper {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 1rem;
  padding: 0 15px;
}

.contact-list {
  display: flex;
  max-height: calc(90dvh - 100px);
  width: 25%;
  padding: 0;
  flex-direction: column;
  background: var(--chat-bg-main);
  border-radius: 5px;
  overflow: hidden;
}

.contact-list2 {
  display: flex;
  max-height: calc(90dvh - 100px);
  width: 25%;
  padding: 0;
  flex-direction: column;
  background: var(--chat-bg-main);
  border-radius: 5px;
  overflow: hidden;
}

.contact-header {
  font-weight: bold;
  padding: 0.5rem;
  padding-left: 0.75rem;
  box-shadow: 0 0 20px #00000080;
  z-index: 1000;

  svg {
    vertical-align: middle;
    margin-right: 0.25rem;
  }
}

.contact-entry {
  display: flex;
  height: 70px;
  padding: 0.75rem;
  align-items: center;
  cursor: pointer;

  &.selected {
    background: var(--chat-bg-highlight);
    cursor: auto;
  }
}

.contact-icon {
  width: 52px;
  min-width: 52px;
  border-radius: 50%;
  height: fit-content;
  aspect-ratio: 1;
}

.contact-info {
  overflow: hidden;
  margin-left: 0.5rem;
}

.contact-name {
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-name2 {
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-intro {
  color: #555;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: nowrap;
  margin: 0.1em 0;
}

.contact-unread {
  display: inline-block;
  font-size: 85%;
  border-radius: 20px;
  padding: 0.05rem 0.3rem;
  background: rgb(0, 123, 255);
  color: #fff;
  vertical-align: 0.1em;
}

.lite-scrollbar {
  overflow: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #00000080;
  }

  &::-webkit-scrollbar-track {
    background-color: #00000030;
  }
}

.chat-main {
  height: 100%;
  flex: 1;
}

.message-panel {
  display: flex;
  height: calc(90dvh - 100px);
  flex-direction: column;
  background: var(--chat-bg-main);
  border-radius: 5px;
  overflow: hidden;
}

.message-header {
  box-shadow: 0 0 20px #00000080;
  z-index: 1000;
}

.message-history {
  flex: 1;
  padding: 0 0.75rem;
}

.message-entry {
  display: flex;
  margin: 0.5rem 0;
  word-break: break-word;
  .contact-icon {
    width: 46px;
  }
}

.message-info {
  margin: 0.5rem;
}

.message-time {
  display: flex;
  justify-content: space-around;
}

.message-time > div {
  padding: 0.1rem 0.75rem;
  background: #cccccc80;
  border-radius: 15px;
  margin: 0.5rem 0;
  font-size: 12px;
  color: var(--chat-text-tips);
}

.message-sender {
  color: #999;
  margin: 0 0.3rem 0.2rem 0.3rem;
  font-size: 13px;
}

.message-body {
  background: var(--chat-bg-highlight);
  padding: 0.3rem 0.7rem;
  border-radius: 0 10px 10px 10px;
  float: left;
}

.message-entry.reversed {
  flex-direction: row-reverse;

  .message-sender {
    text-align: right;
  }

  .message-body {
    border-radius: 10px 0 10px 10px;
    float: right;
  }
}

.message-footer {
  background: var(--chat-bg-highlight);
  box-shadow: 0 0 20px #00000080;
  padding: 0.5rem;
}

.message-input {
  resize: none;
  font-size: 16px;
  font-family: inherit;
  width: 100% !important;
  caret-color: rgb(0, 123, 255);
  padding: 0.5em;
  border-radius: 4px;
  outline: none !important;
  background: var(--chat-bg-main);

  &:hover,
  &:focus {
    box-shadow: 0 0 5px 0.1rem rgba(0, 123, 255, 0.25);
    border-color: rgb(0, 123, 255);
  }
}

.message-send {
  float: right;
  color: var(--chat-text);
  padding: 0.3em 1em;
  border: 1px solid var(--chat-text);
  border-radius: 3px;
  background: var(--chat-bg-main);
  cursor: pointer;

  &:hover {
    color: rgb(0, 123, 255);
    box-shadow: 0 0 5px 0.1rem rgba(0, 123, 255, 0.25);
    border-color: rgb(0, 123, 255);
  }
}

@media screen and (max-width: 768px) {
  .contact-list2 {
    width: 100%;
  }

  .chat-main {
    width: 100%;
  }
}
@media screen and (max-width: 530px) {
  .contact-list {
    width: 18%;
  }

  .contact-name2 {
    font-size: 0px;
  }
}
</style>
