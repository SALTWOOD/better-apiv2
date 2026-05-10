import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS(),
    vue({
      template: {
        compilerOptions: {
          // MDUI 组件识别为自定义元素，不当作 Vue 组件处理
          isCustomElement: (tag) => tag.startsWith('mdui-'),
        },
      },
    }),
  ],
})
