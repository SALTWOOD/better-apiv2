<template>
  <div class="space-y-6">
    <div class="p-6 text-center mb-5">
      <Avatar class="h-24 w-24 mx-auto">
        <AvatarImage :src="authStore.user?.avatarUrl ?? ''" :alt="authStore.user?.name ?? ''" />
        <AvatarFallback>{{ authStore.user?.name?.charAt(0) ?? '?' }}</AvatarFallback>
      </Avatar>
      <div class="grid gap-y-4 justify-center mt-4">
        <div class="text-2xl font-bold">欢迎回来！<span v-if="authStore.isAdmin">开发者</span> {{ authStore.user?.name }}</div>
        <div class="text-sm text-muted-foreground">
          在此发布更新、编辑公告，改善开发人员的生活质量，让 PCL CE 变得更好。
        </div>
      </div>
    </div>
    <div class="grid gap-6 lg:grid-cols-2 grid-cols-1">
      <Card v-if="authStore.isAdmin">
        <CardHeader>
          <CardTitle>发布或修改更新</CardTitle>
          <CardDescription>在此发布新的更新或修改现有的更新。</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator class="my-4" />
        </CardContent>
        <CardFooter>
          <RouterLink to="/admin/updates" custom v-slot="{ navigate }">
            <Button variant="link" @click="navigate">查看更新</Button>
          </RouterLink>
        </CardFooter>
      </Card>
      <Card v-if="authStore.isAdmin">
        <CardHeader>
          <CardTitle>公告管理</CardTitle>
          <CardDescription>您可以创建和管理系统公告，与所有用户沟通。</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator class="my-4" />
        </CardContent>
        <CardFooter>
          <RouterLink to="/admin/announcements" custom v-slot="{ navigate }">
            <Button variant="link" @click="navigate" v-if="authStore.isAdmin">查看公告</Button>
          </RouterLink>
        </CardFooter>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>了解更多</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="divide-y">
            <div class="flex items-center justify-between py-3">
              <div class="flex items-center gap-3">
                <HelpCircle class="size-5 text-muted-foreground" />
                <span>查看帮助选项</span>
              </div>
              <ChevronRight class="size-4 text-muted-foreground" />
            </div>
            <a href="https://github.com/PCL-Community/better-apiv2/issues/new" target="_blank" class="flex items-center justify-between py-3">
              <div class="flex items-center gap-3">
                <MessageSquare class="size-5 text-muted-foreground" />
                <span>发送反馈</span>
              </div>
              <ChevronRight class="size-4 text-muted-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useHead } from '@unhead/vue'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HelpCircle, MessageSquare, ChevronRight } from 'lucide-vue-next'

const authStore = useAuthStore()

useHead({
  title: "主页",
})
</script>
