<template>
  <transition name="fab-slide">
    <div v-if="showFab" class="fab-wrapper fixed bottom-8 right-8">
      <mdui-fab class="fab-el" @click="scrollToTop">
        <mdui-icon-arrow-upward slot="icon"></mdui-icon-arrow-upward>
      </mdui-fab>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useWindowScroll, isClient } from '@vueuse/core'
import { computed } from 'vue'
import "@mdui/icons/arrow-upward"

const props = defineProps<{ threshold?: number }>()
const threshold = props.threshold ?? 100

const { y } = useWindowScroll()

const showFab = computed(() => {
  if (!isClient) return false
  return y.value > threshold
})

const scrollToTop = () => {
  if (isClient) window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.fab-slide-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.fab-slide-enter-active {
  transition: opacity 200ms ease, transform 160ms cubic-bezier(.2,.8,.2,1);
}
.fab-slide-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.fab-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.fab-slide-leave-active {
  transition: opacity 200ms ease, transform 160ms cubic-bezier(.4,.0,.2,1);
}
.fab-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
</style>
