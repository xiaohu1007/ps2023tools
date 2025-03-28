import { URL, fileURLToPath } from 'node:url'
import process from 'node:process'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import { createHtmlPlugin } from 'vite-plugin-html'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  return {
    base: '/ps2023tools/',
    server: {
      host: true,
      port: 5000,
      proxy: {
        '/api': {
          target: '/',
          ws: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        resolvers: [ElementPlusResolver()],
        dts: 'typings/auto-import.d.ts'
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'typings/auto-components.d.ts'
      }),
      // 允许 setup 语法糖上添加组件名属性
      vueSetupExtend(),
      // 生产环境 gzip 压缩资源
      // viteCompression({
      //   verbose: true, // 默认即可
      //   disable: env.VITE_USER_NODE_ENV !== 'production' && env.VITE_USER_NODE_ENV !== 'test', // 开启压缩(不禁用)，默认即可
      //   deleteOriginFile: true, // 删除源文件
      //   filter: /\.(js|mjs|json|css|html|ttf)$/i,
      //   threshold: 10240, // 压缩前最小文件大小
      //   algorithm: 'gzip', // 压缩算法
      //   ext: '.gz' // 文件类型
      // }),
      // 注入模板数据
      createHtmlPlugin({
        inject: {
          data: {
            ENABLE_ERUDA: env.VITE_ENABLE_ERUDA || 'false'
          }
        }
      }),
      createSvgIconsPlugin({
        // 指定要缓存.svg文件的文件夹位置,src/assets/icons/svg为存放svg图片的文件夹
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/svg')],
        // Specify symbolId format
        symbolId: 'icon-[dir]-[name]'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@components': fileURLToPath(
          new URL('./src/components', import.meta.url)
        ),
        '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url))
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true, //css 拆分
      sourcemap: false, //不生成sourcemap
      assetsInlineLimit: 5000, //小于该值 图片将打包成Base64
      rollupOptions: {
        output: {
          // sourcemap: true,
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        }
      },
      terserOptions: {
        compress: {
          drop_console: true,  // 移除 console.log
          drop_debugger: true, // 移除 debugger
        },
        format: {
          comments: false, // 去除注释
        },
      },
    }
  }
})
