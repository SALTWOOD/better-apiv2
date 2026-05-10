<template>
  <div v-if="authStore.isAuthenticated">
    <!-- Desktop: persistent sidebar -->
    <aside
      class="hidden lg:flex flex-col w-64 border-r bg-background h-[calc(100vh-3.5rem)] fixed top-14 z-30"
    >
      <nav class="flex flex-col gap-1 p-4 pt-6">
        <RouterLink to="/" custom v-slot="{ navigate, isExactActive }">
          <Button
            :variant="isExactActive ? 'secondary' : 'ghost'"
            class="w-full justify-start"
            @click="navigate()"
          >
            <Home class="mr-2 size-4" />
            主页
          </Button>
        </RouterLink>
        <template v-if="authStore.isAdmin">
          <Separator class="my-2" />
          <p class="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">管理</p>
          <RouterLink to="/admin/announcements" custom v-slot="{ navigate, isExactActive }">
            <Button
              :variant="isExactActive ? 'secondary' : 'ghost'"
              class="w-full justify-start"
              @click="navigate()"
            >
              <Bell class="mr-2 size-4" />
              公告管理
            </Button>
          </RouterLink>
          <RouterLink to="/admin/updates" custom v-slot="{ navigate, isExactActive }">
            <Button
              :variant="isExactActive ? 'secondary' : 'ghost'"
              class="w-full justify-start"
              @click="navigate()"
            >
              <RefreshCw class="mr-2 size-4" />
              更新管理
            </Button>
          </RouterLink>
          <RouterLink to="/admin/sources" custom v-slot="{ navigate, isExactActive }">
            <Button
              :variant="isExactActive ? 'secondary' : 'ghost'"
              class="w-full justify-start"
              @click="navigate()"
            >
              <Cloud class="mr-2 size-4" />
              下载源管理
            </Button>
          </RouterLink>
        </template>
      </nav>
    </aside>

    <!-- Mobile: sheet drawer -->
    <Sheet :open="isDrawerOpen" @update:open="onSheetOpenChange">
      <SheetContent side="left" class="w-64 p-0">
        <SheetHeader class="px-4 pt-4 pb-0">
          <SheetTitle>导航菜单</SheetTitle>
        </SheetHeader>
        <nav class="flex flex-col gap-1 p-4">
          <RouterLink to="/" custom v-slot="{ navigate, isExactActive }">
            <Button
              :variant="isExactActive ? 'secondary' : 'ghost'"
              class="w-full justify-start"
              @click="navigate(); closeDrawer()"
            >
              <Home class="mr-2 size-4" />
              主页
            </Button>
          </RouterLink>
          <template v-if="authStore.isAdmin">
            <Separator class="my-2" />
            <p class="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">管理</p>
            <RouterLink to="/admin/announcements" custom v-slot="{ navigate, isExactActive }">
              <Button
                :variant="isExactActive ? 'secondary' : 'ghost'"
                class="w-full justify-start"
                @click="navigate(); closeDrawer()"
              >
                <Bell class="mr-2 size-4" />
                公告管理
              </Button>
            </RouterLink>
            <RouterLink to="/admin/updates" custom v-slot="{ navigate, isExactActive }">
              <Button
                :variant="isExactActive ? 'secondary' : 'ghost'"
                class="w-full justify-start"
                @click="navigate(); closeDrawer()"
              >
                <RefreshCw class="mr-2 size-4" />
                更新管理
              </Button>
            </RouterLink>
            <RouterLink to="/admin/sources" custom v-slot="{ navigate, isExactActive }">
              <Button
                :variant="isExactActive ? 'secondary' : 'ghost'"
                class="w-full justify-start"
                @click="navigate(); closeDrawer()"
              >
                <Cloud class="mr-2 size-4" />
                下载源管理
              </Button>
            </RouterLink>
          </template>
        </nav>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useAuthStore } from '../stores/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Home, Bell, RefreshCw, Cloud } from 'lucide-vue-next'

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

function onSheetOpenChange(open: boolean) {
  isDrawerOpen.value = open
}

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
