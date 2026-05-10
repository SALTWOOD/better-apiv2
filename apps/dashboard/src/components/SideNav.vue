<template>
  <mdui-navigation-drawer
    :open="isDrawerOpen"
    @close="closeDrawer"
    :class="{ '!hidden': !authStore.isAuthenticated }"
    close-on-esc
    close-on-overlay-click
  >
    <mdui-list class="px-4 pt-6 lg:mt-16">      
      <RouterLink to="/" custom v-slot="{ navigate, isExactActive }">
        <mdui-list-item
          :active="isExactActive"
          rounded
          role="link"
          tabindex="0"
          @click="navigate(); closeDrawer()"
          @keydown.enter.prevent="navigate(); closeDrawer()"
          @keydown.space.prevent="navigate(); closeDrawer()"
        >
          <mdui-icon-home slot="icon"></mdui-icon-home>
          主页
        </mdui-list-item>
      </RouterLink>
      <template v-if="authStore.isAdmin">
        <mdui-list-subheader>管理</mdui-list-subheader>
        
        <RouterLink to="/admin/announcements" custom v-slot="{ navigate, isExactActive }">
          <mdui-list-item
            :active="isExactActive"
            rounded
            role="link"
            tabindex="0"
            @click="navigate(); closeDrawer()"
            @keydown.enter.prevent="navigate(); closeDrawer()"
            @keydown.space.prevent="navigate(); closeDrawer()"
          >
            <mdui-icon-notifications slot="icon"></mdui-icon-notifications>
            公告管理
          </mdui-list-item>
        </RouterLink>

        <RouterLink to="/admin/updates" custom v-slot="{ navigate, isExactActive }">
          <mdui-list-item
            :active="isExactActive"
            rounded
            role="link"
            tabindex="0"
            @click="navigate(); closeDrawer()"
            @keydown.enter.prevent="navigate(); closeDrawer()"
            @keydown.space.prevent="navigate(); closeDrawer()"
          >
            <mdui-icon-system-update slot="icon"></mdui-icon-system-update>
            更新管理
          </mdui-list-item>
        </RouterLink>

        <RouterLink to="/admin/sources" custom v-slot="{ navigate, isExactActive }">
          <mdui-list-item
            :active="isExactActive"
            rounded
            role="link"
            tabindex="0"
            @click="navigate(); closeDrawer()"
            @keydown.enter.prevent="navigate(); closeDrawer()"
            @keydown.space.prevent="navigate(); closeDrawer()"
          >
            <mdui-icon-cloud slot="icon"></mdui-icon-cloud>
            下载源管理
          </mdui-list-item>
        </RouterLink>
      </template>
    </mdui-list>
  </mdui-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useAuthStore } from '../stores/auth'

import "@mdui/icons/home"
import "@mdui/icons/person"
import "@mdui/icons/notifications"
import "@mdui/icons/system-update"
import "@mdui/icons/cloud"

const router = useRouter()
const authStore = useAuthStore()

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
const isDrawerOpen = ref(isLargeScreen.value)

watch(isLargeScreen, (newVal) => {
  isDrawerOpen.value = newVal
})

watch(() => router.currentRoute.value.path, () => {
  if (!isLargeScreen.value) {
    isDrawerOpen.value = false
  }
})

function closeDrawer() {
  if (!isLargeScreen.value) {
    isDrawerOpen.value = false
  }
}

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}

defineExpose({
  toggleDrawer,
  closeDrawer,
})
</script>