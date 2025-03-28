/*
 * @Author: wuhaohu wuhaohu@zhangzhongyun.com
 * @Date: 2024-09-12 10:23:54
 * @LastEditors: wuhaohu wuhaohu@zhangzhongyun.com
 * @LastEditTime: 2024-09-12 11:50:58
 * @FilePath: \joyreels-video-h5\src\lib\plugins\locales\i18n.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { Locale } from 'vue-i18n'

import { type App, unref } from 'vue'
import { createI18n } from 'vue-i18n'
import type {
  ImportLocaleFn,
  LoadMessageFn,
  LocaleSetupOptions,
  SupportedLanguagesType,
} from './typing'

const loadedLanguages = new Set<string>()

const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: '',
  messages: {},
})

const modules = import.meta.glob('./langs/*.json')

const localesMap = loadLocalesMap(modules)

let loadMessages: LoadMessageFn

/**
 * Load locale modules
 * @param modules
 */
function loadLocalesMap(modules: Record<string, () => Promise<unknown>>) {
  const localesMap: Record<Locale, ImportLocaleFn> = {}

  for (const [path, loadLocale] of Object.entries(modules)) {
    const key = path.match(/([\w-]*)\.(yaml|yml|json)/)?.[1]
    if (key) {
      localesMap[key] = loadLocale as ImportLocaleFn
    }
  }

  return localesMap
}

/**
 * Set i18n language
 * @param locale
 */
function setI18nLanguage(locale: Locale) {
  i18n.global.locale.value = locale

  document?.querySelector('html')?.setAttribute('lang', locale)
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  const { defaultLocale = 'en-US' } = options
  // app可以自行扩展一些第三方库和组件库的国际化
  loadMessages = options.loadMessages || (async () => ({}))
  app.use(i18n)
  await loadLocaleMessages(defaultLocale)

  // 在控制台打印警告
  i18n.global.setMissingHandler((locale, key) => {
    if (options.missingWarn && key.includes('.')) {
      console.warn(
        `[intlify] Not found '${key}' key in '${locale}' locale messages.`,
      )
    }
  })
}

/**
 * Load locale messages
 * @param lang
 */
async function loadLocaleMessages(lang: SupportedLanguagesType) {
  if (unref(i18n.global.locale) === lang) {
    return setI18nLanguage(lang)
  }

  if (loadedLanguages.has(lang)) {
    return setI18nLanguage(lang)
  }

  const message = await localesMap[lang]?.()

  if (message?.default) {
    i18n.global.setLocaleMessage(lang, message.default)
  }

  const mergeMessage = await loadMessages(lang)
  i18n.global.mergeLocaleMessage(lang, mergeMessage)

  loadedLanguages.add(lang)
  return setI18nLanguage(lang)
}

export { i18n, loadLocaleMessages, loadLocalesMap, setupI18n }
