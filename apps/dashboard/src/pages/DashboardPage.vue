<template>
  <div class="space-y-6 mdui-prose">
    <div class="p-6 text-center mb-5">
      <mdui-avatar class="h-24 w-24" :src="authStore.user?.avatarUrl"></mdui-avatar>
      <div class="grid gap-y-4 justify-center mt-4">
        <div class="text-2xl text-bold">欢迎回来！<span v-if="authStore.isAdmin">开发者</span> {{ authStore.user?.name }}</div>
        <div class="text-sm">
          在此发布更新、编辑公告，改善开发人员的生活质量，让 PCL CE 变得更好。
        </div>
      </div>
    </div>
    <div class="grid gap-6 lg:grid-cols-2 grid-cols-1">
      <mdui-card variant="outlined" class="p-6 h-fit w-full" v-if="authStore.isAdmin">
        <div class="mdui-prose">
          <h2>发布或修改更新</h2>
          <p>在此发布新的更新或修改现有的更新。</p>
        </div>
        <mdui-divider class="my-8"></mdui-divider>
        <RouterLink to="/admin/updates" custom v-slot="{ navigate }">
          <mdui-button variant="text" @click="navigate">查看更新</mdui-button>
        </RouterLink>
      </mdui-card>
      <mdui-card variant="outlined" class="p-6 h-fit w-full" v-if="authStore.isAdmin">
        <div class="mdui-prose">
          <h2>公告管理</h2>
          <p>您可以创建和管理系统公告，与所有用户沟通。</p>
        </div>
        <mdui-divider class="my-8"></mdui-divider>
        <RouterLink to="/admin/announcements" custom v-slot="{ navigate }">
          <mdui-button variant="text" @click="navigate" v-if="authStore.isAdmin">查看公告</mdui-button>
        </RouterLink>
      </mdui-card>
      <mdui-card variant="outlined" class="p-6 h-fit w-full lg:col-span-2">
        <div class="mdui-prose">
          <h2>了解更多</h2>
          <mdui-list>
            <mdui-list-item>
              <mdui-icon-help-outline slot="icon"></mdui-icon-help-outline>
              <mdui-icon-chevron-right slot="end-icon"></mdui-icon-chevron-right>
              查看帮助选项
            </mdui-list-item>
            <mdui-divider></mdui-divider>
            <mdui-list-item target="_blank" href="https://github.com/PCL-Community/better-apiv2/issues/new">
              <mdui-icon-feedback--outlined slot="icon"></mdui-icon-feedback--outlined>
              <mdui-icon-chevron-right slot="end-icon"></mdui-icon-chevron-right>
              发送反馈
            </mdui-list-item>
          </mdui-list>
        </div>
      </mdui-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

import "@mdui/icons/help-outline"
import "@mdui/icons/feedback--outlined"
import "@mdui/icons/chevron-right"
import { useHead } from '@unhead/vue'

const authStore = useAuthStore()

useHead({
  title: "主页",
})
</script>

<style scoped>

</style>
