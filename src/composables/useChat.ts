import { reactive, ref } from 'vue'
import { getChatHistory, getChatNotice } from '@/api/chat/chat'
import { getInfoById } from '@/api/info/getInfo'
import { useUserStore } from '@/store/userStore'
import { useEventBus } from './useEventBus'
import { useWebSocket } from './useWebsocket'

export interface RelevantUser {
  userID: number
  email: string
  name: string
  avatarURL: string
  identity: string
  score: number
  unRead: number
}

export interface ChatMessageItem {
  chatMsgID: number
  targetUserID: number
  senderUserID: number
  content: string
  unread: number
  createdAt: string
}

export type Contact = RelevantUser & Partial<{ ban: string, phone: string, punishnum: number, intro: string, unRead: number, emailpush: boolean }>

interface ChatEventMap {
  RelevantUsers: {
    relevantUsers: RelevantUser[]
  }
  NewMessage: ChatMessageItem
  MessageAck: { code: number, msg: string }
}

// 客户端发送的信息
interface ChatMessage {
  Beat: { userID: number, beat: number }
  NewMessage: {
    senderUserID: number
    targetUserID: number
    content: string
  }
}

function isRelevantUsers(event: any): event is ChatEventMap['RelevantUsers'] {
  return 'relevantUsers' in event
}

function isNewMessage(event: any): event is ChatEventMap['NewMessage'] {
  return 'chatMsgID' in event && 'targetUserID' in event && 'senderUserID' in event && 'content' in event
}

function isMessageAck(event: any): event is ChatEventMap['MessageAck'] {
  return 'code' in event && 'msg' in event
}

// 单例模式
const api = {} as {
  connect: () => void
  disconnect: () => void
  sendChatMessage: (content: string) => boolean
  on: <K extends keyof ChatEventMap>(event: K, handler: (data: ChatEventMap[K]) => void) => void
  off: <K extends keyof ChatEventMap>(event: K, handler: (data: ChatEventMap[K]) => void) => void
  selectContact: (contact: Contact) => Promise<void>
  addContact: (contact: RelevantUser) => void
  updateChatNum: () => void
}

let isInit = false
const { userInfo, token } = useUserStore()
const contacts = reactive<Contact[]>([])
const current = reactive<Contact>({
  userID: 0,
  email: '',
  name: '',
  avatarURL: '',
  identity: '',
  score: 0,
  unRead: 0,
})
// 当前会话的聊天记录
const chatHistory = reactive<ChatMessageItem[]>([])
const chatNum = ref(0)

let dummyID = 100000000
function getDummyID() {
  dummyID += 1
  return dummyID
}

export function useChat() {
  const init = () => {
    if (isInit) {
      return
    }

    isInit = true
    const wsURL = new URL('/websocket/auth/chat', import.meta.env.VITE_API_BASE_URL)
    wsURL.searchParams.append('token', token.value)
    wsURL.protocol = wsURL.protocol.replace('http', 'ws')
    const { connect, sendWebSocketMessage, on: listenWebSocket, disconnect: disconnectWebSocket } = useWebSocket<ChatEventMap, ChatMessage>(wsURL, {
      keepAliveOptions: {
        interval: 30000,
        fn: (sendWebSocketMessage) => {
          sendWebSocketMessage({ userID: userInfo.userID, beat: 1 })
        },
      },
    })
    const { emit, on, off, cleanup } = useEventBus<ChatEventMap>()

    // 也许未来有机会可以再封装吧, 现在好像没什么用
    const sendMessage = sendWebSocketMessage

    const sendChatMessage = (content: string) => {
      if (current.userID === 0) {
        return false
      }

      const message = {
        senderUserID: userInfo.userID,
        targetUserID: current.userID,
        content,
      }
      const result = sendMessage(message)

      if (result) {
        chatHistory.push({
          ...message,
          createdAt: new Date().toISOString(),
          chatMsgID: getDummyID(),
          unread: 0,
        })
      }

      return result
    }

    const updateChatNum = () => {
      // TODO: 需要取消上一次请求, 不过之后再统一封装一个函数吧
      getChatNotice(userInfo.userID)
        .then((resp) => {
          chatNum.value = resp.data.noticeNum
        })
        .catch(() => {
          // 不想处理了
          chatNum.value = 0
        })
    }

    const handleSocketMessage = <K extends keyof ChatEventMap>(data: ChatEventMap[K]) => {
      if (isNewMessage(data)) {
        if (data.targetUserID !== userInfo.userID) {
          // 不是发给我的消息
          return
        }

        emit('NewMessage', data)
        updateChatNum()
        if (data.senderUserID === current.userID) {
          // 当前会话
          chatHistory.push(data)
          return
        }

        // 不是当前会话
        const idx = contacts.findIndex(it => it.userID === data.senderUserID)
        if (idx === -1) {
          // 新发来的信息
          getInfoById(data.senderUserID).then((res) => {
            contacts.unshift({
              ...res,
              unRead: 1,
              identity: '',
            })
          })
        }
        else {
          const contact = contacts[idx]
          contact.unRead = (contact.unRead || 0) + 1
        }
      }

      if (isRelevantUsers(data)) {
        // 这个事件貌似只在最开始的时候触发一次
        // 不知道为什么要去重, 不过既然原本去重了, 这里也去重吧
        const seen = new Set<number>()
        const users = data.relevantUsers.reduce<Contact[]>((acc, currentUser) => {
          if (seen.has(currentUser.userID)) {
            return acc
          }
          acc.push(currentUser)
          seen.add(currentUser.userID)
          return acc
        }, [])
        Promise.all(users.map(user => getInfoById(user.userID))).then((resList) => {
          contacts.splice(0, contacts.length, ...users.map((user, index) => ({ ...user, ...resList[index], unRead: 0 })))
        })
      }

      if (isMessageAck(data)) {
        emit('MessageAck', data)
      }
    }

    listenWebSocket('Message', (data) => {
      handleSocketMessage(data)
    })

    const addContact = (contact: RelevantUser) => {
      if (!contacts.find(c => c.userID === contact.userID)) {
        contacts.push(contact)
      }
    }

    const selectContact = async (contact: Contact) => {
      if (current.userID === contact.userID) {
        return Promise.resolve()
      }
      // 在contacts中找到这个contact
      const idx = contacts.findIndex(c => c.userID === contact.userID)
      if (idx === -1) {
        return Promise.reject(new Error('Contact not found'))
      }

      contacts[idx].unRead = 0
      Object.assign(current, contacts[idx])
      chatHistory.splice(0, chatHistory.length)
      // 看上去是获取聊天记录, 实际上还有个已读功能
      await getChatHistory(userInfo.userID, current.userID).then((res) => {
        if (res.code === 200) {
          chatHistory.splice(0, chatHistory.length, ...res.data.chatHistoryList)
        }
      })
      updateChatNum()
    }

    Object.assign(api, {
      connect,
      disconnect() {
        cleanup()
        disconnectWebSocket()
      },
      sendChatMessage,
      on,
      off,

      addContact,
      selectContact,

      updateChatNum,
    })
  }

  init()

  return {
    ...api,
    contacts,
    chatHistory,
    current,
    chatNum,
  }
}
