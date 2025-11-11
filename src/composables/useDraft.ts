import { reactive } from 'vue'
import { useIndexedDB } from './useIndexedDB'

const DRAFT_STORE = 'drafts_store'

export interface Draft {
  id?: number
  title: string
  content: string
}

// 增查删改草稿
const db = useIndexedDB('drafts', {
  version: 1,
  onUpgradeneeded(event) {
    const db = (event.target as IDBOpenDBRequest).result as IDBDatabase

    const store = db.createObjectStore(DRAFT_STORE, { keyPath: 'id', autoIncrement: true })

    store.createIndex('title', 'title', { unique: false })
  },
})

export function useDraft() {
  const drafts = reactive<Draft[]>([])
  const current = reactive<Draft>({
    title: '',
    content: '',
  })

  const addDraft = async (draft: Draft) => {
    const tx = await db.transaction([DRAFT_STORE], 'readwrite')
    const store = tx.objectStore(DRAFT_STORE)

    const id = await store.add(draft) as unknown as number
    drafts.push({ ...draft, id })

    tx.commit()

    return id
  }

  const syncDrafts = async () => {
    const tx = await db.transaction([DRAFT_STORE], 'readonly')
    const store = tx.objectStore(DRAFT_STORE)

    const allDrafts = await store.getAll() as unknown as Draft[]

    tx.commit()

    drafts.splice(0, drafts.length, ...allDrafts)
  }

  // 只支持title或者id查
  const getDraftBy = async (key: string | number) => {
    if (typeof key === 'number') {
      return drafts.find(d => d.id === key)
    } else {
      return drafts.find(d => d.title === key)
    }
  }

  const deleteDraft = async (id: number) => {
    const tx = await db.transaction([DRAFT_STORE], 'readwrite')
    const store = tx.objectStore(DRAFT_STORE)

    await store.delete(id)
    const index = drafts.findIndex(d => d.id === id)
    if (index !== -1) {
      drafts.splice(index, 1)
    }
    tx.commit()
  }

  const updateDraft = async (draft: Draft) => {
    const tx = await db.transaction([DRAFT_STORE], 'readwrite')
    const store = tx.objectStore(DRAFT_STORE)

    if (draft.id) {
      await store.put(draft)
      drafts.splice(drafts.findIndex(d => d.id === draft.id), 1, draft)
    }
    tx.commit()
  }

  const selectDraft = (id: number) => {
    const draft = drafts.find(d => d.id === id)
    if (draft) {
      Object.assign(current, draft)
    }
  }

  return {
    drafts,
    current,
    selectDraft,
    addDraft,
    syncDrafts,
    getDraftBy,
    deleteDraft,
    updateDraft,
  }
}
