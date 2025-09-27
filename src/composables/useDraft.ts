import { useIndexedDB } from './useIndexedDB'

const DRAFT_STORE = 'drafts_store'

interface Draft {
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
  const addDraft = async (draft: Draft) => {
    const store = await db.transaction([DRAFT_STORE], 'readwrite').then(tx => tx.objectStore(DRAFT_STORE))

    const id = await store.add(draft)

    return id
  }

  // 一次性查所有吧, 估计也不会太多
  const getDrafts = async (options?: { limit: number, offset: number }) => {
    // 要是没有options, 查所有
    const store = await db.transaction([DRAFT_STORE], 'readonly').then(tx => tx.objectStore(DRAFT_STORE))

    // 这玩意不能分页??
    const allDrafts = await store.getAll() as unknown as Draft[]

    if (!options) {
      return allDrafts
    }

    const { limit, offset } = options

    return allDrafts.slice(offset, offset + limit)
  }

  // 只支持title或者id查
  const getDraftBy = async (key: string | number) => {
    const store = await db.transaction([DRAFT_STORE], 'readonly').then(tx => tx.objectStore(DRAFT_STORE))

    if (typeof key === 'number') {
      return store.get(key) as unknown as Draft | undefined
    }

    const index = store.index('title')

    return index.get(key) as unknown as Draft | undefined
  }

  const deleteDraft = async (id: number) => {
    const store = await db.transaction([DRAFT_STORE], 'readwrite').then(tx => tx.objectStore(DRAFT_STORE))

    await store.delete(id)
  }

  const updateDraft = async (draft: Draft) => {
    const store = await db.transaction([DRAFT_STORE], 'readwrite').then(tx => tx.objectStore(DRAFT_STORE))

    if (draft.id) {
      await store.put(draft)
    }
  }

  return {
    addDraft,
    getDrafts,
    getDraftBy,
    deleteDraft,
    updateDraft,
  }
}
