import '@/assets/snackbar.css'

interface SnackbarOptions {
  message: string
  actionText?: string
  duration?: number
  position?: 'top' | 'bottom'
  type?: 'success' | 'error' | 'info' | 'warning'
  onAction?: () => void
  onClose?: () => void
  id?: string
  alwaysShow?: boolean
}

interface SnackbarInstance {
  show: () => void
  hide: () => void
  destroy: () => void
  updateMessage: (message: string) => void
  id?: string
}

class SnackbarManager {
  private instances: Map<string, SnackbarInstance> = new Map()
  private container: HTMLElement | null = null
  private isDestroyed = false
  private hideTimers: Map<string, NodeJS.Timeout> = new Map()

  private createContainer(): HTMLElement {
    if (this.container)
      return this.container

    this.container = document.createElement('div')
    this.container.className = 'snackbar-container'
    document.body.appendChild(this.container)
    return this.container
  }

  private createSnackbar(options: SnackbarOptions): SnackbarInstance {
    const id = options.id || Math.random().toString(36).substr(2, 9)
    const container = this.createContainer()

    const snackbar = document.createElement('div')
    snackbar.className = `snackbar snackbar--${options.position || 'bottom'} snackbar--${options.type || 'info'}`
    snackbar.style.opacity = '0'
    snackbar.style.transform = options.position === 'top'
      ? 'translateX(-50%) translateY(-20px)'
      : 'translateX(-50%) translateY(20px)'

    const content = document.createElement('div')
    content.className = 'snackbar-content'

    const message = document.createElement('span')
    message.className = 'snackbar-message'
    message.textContent = options.message
    content.appendChild(message)

    let timeoutId: NodeJS.Timeout | null = null

    const instance: SnackbarInstance = {
      id,
      show: () => {
        // 显示动画
        requestAnimationFrame(() => {
          snackbar.style.transition = 'all 0.3s ease'
          snackbar.style.opacity = '1'
          snackbar.style.transform = 'translateX(-50%) translateY(0)'
        })

        // 自动隐藏（alwaysShow为true时忽略duration）
        if (!options.alwaysShow && options.duration && options.duration > 0) {
          timeoutId = setTimeout(() => {
            instance.hide()
          }, options.duration)
        }
      },

      hide: () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        snackbar.style.transition = 'all 0.3s ease'
        snackbar.style.opacity = '0'
        snackbar.style.transform = options.position === 'top'
          ? 'translateX(-50%) translateY(-20px)'
          : 'translateX(-50%) translateY(20px)'

        // 清除之前的销毁定时器
        if (options.id && this.hideTimers.has(options.id)) {
          clearTimeout(this.hideTimers.get(options.id)!)
          this.hideTimers.delete(options.id)
        }

        // 对于 alwaysShow 的snackbar，不设置自动销毁定时器
        if (!options.alwaysShow) {
          // 设置500ms后自动销毁（如果没有重新调用）
          if (options.id) {
            const destroyTimer = setTimeout(() => {
              if (snackbar.parentNode) {
                snackbar.parentNode.removeChild(snackbar)
              }
              this.instances.delete(id)
              this.hideTimers.delete(options.id!)
            }, 500)
            this.hideTimers.set(options.id, destroyTimer)
          }
          else {
            // 没有ID的实例300ms后销毁
            setTimeout(() => {
              if (snackbar.parentNode) {
                snackbar.parentNode.removeChild(snackbar)
              }
              this.instances.delete(id)
            }, 300)
          }
        }
      },

      destroy: () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        // 清除销毁定时器
        if (options.id && this.hideTimers.has(options.id)) {
          clearTimeout(this.hideTimers.get(options.id)!)
          this.hideTimers.delete(options.id)
        }
        if (snackbar.parentNode) {
          snackbar.parentNode.removeChild(snackbar)
        }
        this.instances.delete(id)
      },

      updateMessage: (newMessage: string) => {
        message.textContent = newMessage
      },
    }

    if (options.actionText) {
      const actionButton = document.createElement('button')
      actionButton.className = 'snackbar-action'
      actionButton.textContent = options.actionText
      actionButton.addEventListener('click', () => {
        options.onAction?.()
        // alwaysShow的snackbar点击后直接销毁，否则隐藏
        if (options.alwaysShow) {
          instance.destroy()
        }
        else {
          instance.hide()
        }
      })
      content.appendChild(actionButton)
    }

    const closeButton = document.createElement('button')
    closeButton.className = 'snackbar-close'
    closeButton.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    closeButton.addEventListener('click', () => {
      options.onClose?.()
      // alwaysShow的snackbar点击后直接销毁，否则隐藏
      if (options.alwaysShow) {
        instance.destroy()
      }
      else {
        instance.hide()
      }
    })

    snackbar.appendChild(content)
    snackbar.appendChild(closeButton)
    container.appendChild(snackbar)

    this.instances.set(id, instance)
    return instance
  }

  show(options: SnackbarOptions): SnackbarInstance {
    if (this.isDestroyed) {
      throw new Error('SnackbarManager has been destroyed')
    }

    // 如果指定了ID，检查是否已存在，存在则更新消息并重新显示
    if (options.id) {
      const existingInstance = this.instances.get(options.id)
      if (existingInstance) {
        // 清除销毁定时器（因为重新调用了）
        if (this.hideTimers.has(options.id)) {
          clearTimeout(this.hideTimers.get(options.id)!)
          this.hideTimers.delete(options.id)
        }

        // 更新现有实例的消息并重新显示
        existingInstance.updateMessage(options.message)
        existingInstance.show()
        return existingInstance
      }
    }

    // 创建新的snackbar实例

    const instance = this.createSnackbar(options)
    instance.show()
    return instance
  }

  // 封装了常用的几个函数
  success(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
    return this.show({
      message,
      actionText,
      type: 'success',
      duration: 4000,
      position: 'bottom',
      onAction,
    })
  }

  error(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
    return this.show({
      message,
      actionText,
      type: 'error',
      duration: 4000,
      position: 'top',
      onAction,
    })
  }

  info(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
    return this.show({
      message,
      actionText,
      type: 'info',
      duration: 4000,
      position: 'bottom',
      onAction,
    })
  }

  warning(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
    return this.show({
      message,
      actionText,
      type: 'warning',
      duration: 4000,
      position: 'top',
      onAction,
    })
  }
}

// 创建全局实例
const snackbar = new SnackbarManager()

/**
 * @description 显示snackbar
 * @param {SnackbarOptions} options snackbar配置选项
 */
export function showSnackbar(options: SnackbarOptions): SnackbarInstance {
  return snackbar.show(options)
}

/**
 * @description 显示成功提示
 * @param {string} message 提示消息
 * @param {string} actionText 操作按钮文字
 * @param {Function} onAction 操作回调
 */
export function showSuccess(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
  return snackbar.success(message, actionText, onAction)
}

/**
 * @description 显示错误提示
 * @param {string} message 提示消息
 * @param {string} actionText 操作按钮文字
 * @param {Function} onAction 操作回调
 */
export function showError(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
  return snackbar.error(message, actionText, onAction)
}

/**
 * @description 显示信息提示
 * @param {string} message 提示消息
 * @param {string} actionText 操作按钮文字
 * @param {Function} onAction 操作回调
 */
export function showInfo(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
  return snackbar.info(message, actionText, onAction)
}

/**
 * @description 显示警告提示
 * @param {string} message 提示消息
 * @param {string} actionText 操作按钮文字
 * @param {Function} onAction 操作回调
 */
export function showWarning(message: string, actionText?: string, onAction?: () => void): SnackbarInstance {
  return snackbar.warning(message, actionText, onAction)
}

export default {
  show: showSnackbar,
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
}
