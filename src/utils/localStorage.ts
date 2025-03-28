
const whiteList: string | any[] = [] // 本地存储 clear 白名单

/**
 * 获取本地存储的所有键名
 * @returns {Array} 一个包含所有键名的数组
 */
function getAllLocalStorageKeys() {
  let keys = []
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i))
  }
  return keys
}

export default {
  set(name: string, value?: any, expirationMinutes?: number) {
    const options: any = {}
    const data = {
      value,
      expires: (expirationMinutes || 0) * 60 * 1000, // 过期时间
      startTime: new Date().getTime(), // 记录何时将值存入缓存，毫秒级
    }

    Object.assign(options, data)
    // 如果options.expires设置了的话 name为key，options为值放进去

    localStorage.setItem(name, JSON.stringify(options?.expires ? options : options?.value))
  },

  get(name: string) {
    let item: any = localStorage.getItem(name)

    if (!item) return item

    item = JSON.parse(item)

    if (!item?.startTime) return item

    const date = new Date().getTime() - item.startTime

    if (date > item.expires) {
      localStorage.removeItem(name)
      return null
    } else {
      return item.value
    }
  },

  remove(name: string) {
    localStorage.removeItem(name)
  },

  clear() {
    // 删除 除白名单 外的所有本地存储
    const keys: any = getAllLocalStorageKeys()
    keys.forEach((key: any) => {
      if (!whiteList.includes(key)) {
        localStorage.removeItem(key)
      }
    })
  },

  getSet(name: string, value: string) {
    const getVal = this.get(name)
    if (!getVal) {
      this.set(name, value || '')
    }
    return getVal || value
  }
}



