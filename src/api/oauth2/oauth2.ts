import { showMsg } from '@/components/MessageBox'
import { requestFunc } from '../req'

export interface OAuth2Info {
  app_id: string
  redirect_uri: string
  response_type: string
  scope: string
  state: string
}

export interface OAuth2AppInfo {
  app_id: string
  app_name: string
  app_icon: string
  description: string
}

export interface OAuth2AuthorizeResponse {
  redirect_url: string
}

/**
 * 检查OAuth2应用信息
 * @param appId 应用ID
 * @returns 应用信息
 */
export async function checkOAuth2App(appId: string): Promise<OAuth2AppInfo> {
  const response = await requestFunc('/auth/connect/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      app_id: appId,
    },
  }, true)

  if (!response) {
    showMsg('网络请求失败')
    return { app_id: '', app_name: '', app_icon: '', description: '' }
  }

  const result = await response?.json()

  if (result.code !== 200) {
    showMsg(result.message || '获取应用信息失败')
    return { app_id: '', app_name: '', app_icon: '', description: '' }
  }

  return result.data
}

/**
 * 授权OAuth2应用
 * @param oauth2Info OAuth2授权信息
 * @returns 授权结果
 */
export async function authorizeOAuth2App(oauth2Info: OAuth2Info): Promise<OAuth2AuthorizeResponse> {
  const response = await requestFunc('/auth/connect/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: oauth2Info,
  }, true)

  if (!response) {
    showMsg('网络请求失败')
    return { redirect_url: '' }
  }

  const result = await response.json()

  if (result.code !== 200) {
    showMsg(result.message || '授权失败')
    return { redirect_url: '' }
  }

  return result.data
}
