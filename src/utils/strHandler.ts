function strHandler(type: 'img', str: string): string[]
function strHandler(type: 'time', str: string): string
function strHandler(type: 'postImg', str: string): string

/**
 * @description 处理字符串
 * @param {string} type img，time，postImg中的一个。img为预览图，time为时间。postImg是原图
 * @param {string} str
 */
function strHandler(type: 'img' | 'time' | 'postImg', str: string): string | string[] {
  if (!str)
    return ''
  switch (type) {
    case 'img':
      return str.split('|')
    case 'time':
      return str.replace('T', ' ').split('+')[0]
    case 'postImg':
      return str.replace('resized', 'uploads')
    default:
      return str
  }
};

export { strHandler }
