<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDark } from '@vueuse/core'
import { Toaster } from '@/components/ui/sonner'

import "@fontsource-variable/google-sans/wght.css"
import { useHead } from '@unhead/vue'

useHead({
  titleTemplate: (title) => {
    return title ? `${title} - PCL CE 管理后台` : 'PCL CE 管理后台'
  }
})

// VueUse dark mode — toggles `dark` class on <html>
useDark()

const loading = ref(true)

onMounted(() => {
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
  <div v-show="loading" class="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20 overflow-hidden">
    <div class="h-full bg-primary animate-indeterminate-progress"></div>
  </div>
  <Toaster rich-colors position="top-center" />
  <RouterView />
</template>

<style>
@keyframes indeterminate-progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}
.animate-indeterminate-progress {
  animation: indeterminate-progress 1.2s ease-in-out infinite;
}
</style>
