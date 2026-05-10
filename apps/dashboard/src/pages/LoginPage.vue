<template>
  <div class="w-full min-h-screen flex items-center justify-center">
    <Card class="w-full max-w-md">
      <CardContent class="p-6">
        <h2 class="text-2xl font-bold text-center">Better PCL CE</h2>
        <p class="text-center">使用 GitHub 账号登录</p>

        <Button
          class="w-full"
          @click="handleLogin"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          <Github v-else class="mr-2" :size="18" />
          用 GitHub 登录
        </Button>

        <p class="text-center text-sm text-gray-500">
          该应用仅供 PCL Community 核心成员使用
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { isClient } from "@vueuse/core";
import { useHead } from "@unhead/vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Loader2 } from "lucide-vue-next";

useHead({
  title: "登录",
});

const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    if (isClient) {
      const apiBase =
        (import.meta.env.VITE_API_URL as string) || window.location.origin;
      const state = crypto.randomUUID();
      localStorage.setItem('oauth_state', state);

      setTimeout(() => {
        window.location.href = `${apiBase.replace(/\/$/, "")}/auth/github/login?state=${state}`;
      }, 1000)
    }
  } catch (error) {
    console.error("登录失败:", error);
  } 
}
</script>
