import { getInfoById } from '@/api/info/getInfo'
import type { AllInfo } from '@/api/info/getInfo'

// 卖家名称缓存
const sellerNameCache = new Map<number, string>()

/**
 * 根据卖家ID获取卖家名称
 * @param sellerId 卖家ID
 * @returns 卖家名称
 */
export async function getSellerName(sellerId: number): Promise<string> {
  // 如果缓存中有，直接返回
  if (sellerNameCache.has(sellerId)) {
    return sellerNameCache.get(sellerId)!
  }

  try {
    // 从API获取用户信息
    const userInfo: AllInfo = await getInfoById(sellerId)
    
    if (userInfo && userInfo.name) {
      // 缓存结果
      sellerNameCache.set(sellerId, userInfo.name)
      return userInfo.name
    }
    
    // 如果获取失败，返回默认值
    return `用户${sellerId}`
  } catch (error) {
    console.error('获取卖家名称失败:', error)
    // 返回默认值
    return `用户${sellerId}`
  }
}

/**
 * 批量获取卖家名称
 * @param sellerIds 卖家ID数组
 * @returns 卖家ID到名称的映射
 */
export async function getSellerNames(sellerIds: number[]): Promise<Map<number, string>> {
  const result = new Map<number, string>()
  
  // 并行获取所有卖家名称
  const promises = sellerIds.map(async (sellerId) => {
    const name = await getSellerName(sellerId)
    result.set(sellerId, name)
  })
  
  await Promise.all(promises)
  return result
}

/**
 * 清除缓存
 */
export function clearSellerNameCache(): void {
  sellerNameCache.clear()
}

/**
 * 预加载卖家名称
 * @param sellerIds 卖家ID数组
 */
export async function preloadSellerNames(sellerIds: number[]): Promise<void> {
  const uncachedIds = sellerIds.filter(id => !sellerNameCache.has(id))
  
  if (uncachedIds.length > 0) {
    await getSellerNames(uncachedIds)
  }
}


