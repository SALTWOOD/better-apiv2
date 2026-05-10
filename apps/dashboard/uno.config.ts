import { defineConfig } from 'unocss'
import presetWind from '@unocss/preset-wind'
import presetIcons from '@unocss/preset-icons'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      collections: {
        mdi: () => import('@iconify-json/mdi').then(i => i.icons),
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  // UnoCSS 配置为支持 shadow DOM（Web Components 如 MDUI）
  // 通过 uno 的内置 @layer 指令和 @apply 支持 shadow DOM 中的样式注入
  layers: {
    preflights: -2,
    components: -1,
    utilities: 1,
  },
})
