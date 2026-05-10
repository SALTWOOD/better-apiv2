<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { setTheme } from 'mdui/functions/setTheme.js'
import { setColorScheme } from 'mdui'
import { useDark } from '@vueuse/core'

import "mdui/mdui.css"
import "@fontsource-variable/google-sans/wght.css"
import { useHead } from '@unhead/vue'

useHead({
  titleTemplate: (title) => {
    return title ? `${title} - PCL CE 管理后台` : 'PCL CE 管理后台'
  }
})

// 初始化主题
setColorScheme('#0067db')
const isDark = useDark()

const loading = ref(true)

onMounted(() => {
  setTheme(isDark.value ? 'dark' : 'light')
  // 页面初始挂载后短暂展示加载条
  setTimeout(() => (loading.value = false), 200)
})

// 路由导航钩子来控制顶部进度条
const router = useRouter()
router.beforeEach((_to, _from, next) => {
  loading.value = true
  next()
})
router.afterEach(() => {
  // 小延迟以避免闪烁
  setTimeout(() => (loading.value = false), 120)
})
router.onError(() => {
  loading.value = false
})
</script>

<template>
  <mdui-linear-progress v-show="loading" class="app-top-progress fixed top-0 left-0 right-0 z-9999 h-1" indeterminate></mdui-linear-progress>
  <RouterView />
</template>
