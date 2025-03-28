
import { createApp } from 'vue'
import App from './App.vue'
import { setupI18n } from './locales'
import { initStores } from './stores'
import router from '@/router'
import SvgIcon from './components/SvgIcon.vue'
import "virtual:svg-icons-register"
import directive from '@/directive'
import "animate.css/animate.min.css";

async function bootstrap(namespace: string) {

  const app = createApp(App)

  app.component('SvgIcon', SvgIcon)

  // 自定义指令
  directive(app)

  // 国际化 i18n 配置
  await setupI18n(app)

  // 配置 pinia-tore
  await initStores(app, { namespace })

  // 配置路由及路由守卫
  app.use(router)

  app.mount('#app')
}

export { bootstrap }
