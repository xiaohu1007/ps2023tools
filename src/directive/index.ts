import type { App } from 'vue'

// 自定义指令
const directives: any = {
  
}

export default (app: App<Element>) => {
  Object.keys(directives).forEach((key: any) => {
    app.directive(key, directives[key])
  })
}