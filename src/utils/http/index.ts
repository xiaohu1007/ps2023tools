
import axios, { type InternalAxiosRequestConfig } from 'axios'
import 'vant/es/toast/style'
import localStorage from '@/utils/localStorage';
import { v4 as uuidv4 } from 'uuid'

/**
 * 取消请求的机制（用于取消重复请求接口）
 */
const pendingQueue = new Map()
const CancelToken = axios.CancelToken
// 判断请求是否在队列中，如果在就对队列中的该请求执行取消操作
const judgePendingFunc = function (config: InternalAxiosRequestConfig<any>) {
  if (pendingQueue.has(`${config.method}->${config.url}`)) {
    pendingQueue.get(`${config.method}->${config.url}`)() // 注意这里的括号不要漏掉
  }
}
// 删除队列中对应已执行的请求
const removeResolvedFunc = function (config: InternalAxiosRequestConfig<any>) {
  if (pendingQueue.has(`${config.method}->${config.url}`)) {
    pendingQueue.delete(`${config.method}->${config.url}`)
  }
}

/**
 * 不需要显示加载动画的api
 */
const notLoadUrl: (string | undefined)[] = []

// 提示
const showToastTip = (message: string) => {
}

interface ResponseData {
  token?: string
  code: number
  data: any
  message: string
}

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL, // api的base_url
  timeout: 30000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})
// 请求拦截器
request.interceptors.request.use(
  (config) => {
    judgePendingFunc(config) // 请求发起之前先调用removeResolvedFunc方法
    // 将pending队列中的请求设置为当前
    config.cancelToken = new CancelToken((cb) => {
      pendingQueue.set(`${config.method}->${config.url}`, cb) // cb就是取消该请求的方法，调用它就能cancel掉当前请求
    })
    if (!notLoadUrl.includes(config.url)) {
      // 加载动画开始
    }

    // token
    const token = `Bearer ${localStorage.get('token')}`
    if (localStorage.get('token')) {
      config.headers['Authorization'] = token
    } else {
      config.headers['x-udid'] = localStorage.getSet('uuid', uuidv4().replace(/-/g, ''))
    }

    return config
  },
  (error: any) => {
    // 加载动画结束及错误信息提示
    showToastTip(error.message)
    return Promise.reject(error)
  },
)
// 响应拦截器
request.interceptors.response.use(
  (response): any => {
    removeResolvedFunc(response.config) // 调用removeResolvedFunc在队列中删除执行过的请求
    if (!notLoadUrl.includes(response.config.url)) {
      // xxxxxx
    } // 加载动画结束

    const res = response.data as ResponseData
    if (response.status === 200) { // 如果请求连接成功
      // TODO： 登录时的参数
      return Promise.resolve(response)
    } else { // 请求失败 通过message 提示错误信息
      showToastTip(response.data.message)
      return Promise.reject(response)
    }
  },
  (error: any) => {
    // 加载动画结束及错误信息提示
    // xxxxxx
    const { response } = error
    if (response) {
      // 请求已发出，但是不在2xx的范围
      showToastTip(error.message)
      return Promise.reject(response.data)
    } else {
      if (error.name == 'CanceledError') return;
      showToastTip(error.message || 'network error!')
    }
  },
)
// 封装get请求
export function GET(url: string, params?: any, options?: any) {
  return request.get(url, { params, ...(options || {}) })
}
// 封装post请求
export function POST(url: string, data?: any) {
  return request.post(url, data || {})
}
// 封装delete请求
export function DELETE(url: string, data?: any) {
  return request.delete(url, { data })
}
// 封装patch请求
export function PATCH(url: string, data?: any) {
  return request.patch(url, data || {})
}

export default request
