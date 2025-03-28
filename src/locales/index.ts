import type { App } from 'vue'
import { ref } from 'vue'

import dayjs from 'dayjs'

import type { LocaleSetupOptions, SupportedLanguagesType } from '@/lib/plugins/locales'
import { $t, setupI18n as coreSetup, loadLocalesMap } from '@/lib/plugins/locales'

const modules = import.meta.glob('./langs/*.json')

const localesMap = loadLocalesMap(modules)

/**
 * 加载应用特有的语言包
 * 这里也可以改造为从服务端获取翻译数据
 * @param lang
 */
async function loadMessages(lang: SupportedLanguagesType) {
  const [appLocaleMessages] = await Promise.all([
    localesMap[lang]?.(),
    loadThirdPartyMessage(lang),
  ])
  return appLocaleMessages?.default
}

/**
 * 加载第三方组件库的语言包
 * @param lang
 */
async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([loadDayjsLocale(lang)])
}

/**
 * 加载dayjs的语言包
 * @param lang
 */
async function loadDayjsLocale(lang: SupportedLanguagesType) {
  let locale
  switch (lang) {
    case 'en-US': {
      locale = await import('dayjs/locale/en')
      break
    }
    // 默认使用英语
    default: {
      locale = await import('dayjs/locale/en')
    }
  }
  if (locale) {
    dayjs.locale(locale)
  }
  else {
    console.error(`Failed to load dayjs locale for ${lang}`)
  }
}

/**
 * 加载element-plus的语言包
 * @param lang
 */

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: 'en-US',
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  })
}

export { $t, loadMessages, setupI18n }
