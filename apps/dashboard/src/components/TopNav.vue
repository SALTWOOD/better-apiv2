<template>
  <header
    class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="flex h-14 items-center px-4 gap-2">
      <Button variant="ghost" size="icon" class="lg:hidden" @click="toggleDrawer">
        <Menu class="size-5" />
      </Button>
      <span class="hidden lg:inline lg:ml-4 font-semibold text-lg">PCL CE 管理后台</span>
      <span class="block lg:hidden font-semibold text-lg">管理后台</span>
      <div class="flex-1" />
      <Button variant="ghost" size="icon" class="mr-2" @click="toggleDark()">
        <Sun v-if="isDark" class="size-5" />
        <Moon v-else class="size-5" />
      </Button>
      <DropdownMenu v-if="authStore.isAuthenticated">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="rounded-full">
            <Avatar>
              <AvatarImage :src="authStore.user?.avatarUrl ?? ''" :alt="authStore.user?.login ?? ''" />
              <AvatarFallback>{{ authStore.user?.login?.charAt(0)?.toUpperCase() ?? '?' }}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">目前登录的身份</p>
              <p class="text-xs leading-none text-muted-foreground">{{ authStore.user?.login }}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout" class="cursor-pointer">
            <LogOut class="mr-2 size-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { isClient, useDark, useToggle } from '@vueuse/core'
import { useAuthStore } from '../stores/auth'
import { logout } from '../services/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Menu, Sun, Moon, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()

const emit = defineEmits<{
  toggleDrawer: []
}>()

const isDark = useDark()
const toggleDark = useToggle(isDark)

function toggleDrawer() {
  emit('toggleDrawer')
}

async function handleLogout() {
  logout()
  if (isClient) {
    window.location.href = '/login'
  }
}
</script>
