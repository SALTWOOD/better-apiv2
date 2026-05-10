<template>
  <div class="space-y-4 mdui-prose">
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div>
        <h1 class="text-3xl font-bold">下载源管理</h1>
        <p class="text-sm text-gray-500">
          配置多 CDN 镜像源，为更新文件提供多个下载地址
        </p>
      </div>
      <mdui-button variant="filled" @click="openCreateDialog">
        <mdui-icon-add slot="icon"></mdui-icon-add>
        新增下载源
      </mdui-button>
    </div>

    <div class="text-center py-12" v-if="isLoading">
      <mdui-circular-progress indeterminate></mdui-circular-progress>
      <p class="text-sm text-gray-500">正在加载下载源列表</p>
    </div>

    <div class="text-center py-12" v-else-if="sources.length === 0">
      <mdui-icon-cloud-off class="w-16 h-16"></mdui-icon-cloud-off>
      <p class="text-sm text-gray-500">暂无下载源配置</p>
    </div>

    <div v-else class="space-y-3">
      <mdui-card v-for="source in sources" :key="source.id" class="p-6 w-full">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-start gap-2">
              <h3 class="text-lg font-semibold">{{ source.name }}</h3>
            </div>
            <p class="text-md text-gray-600 break-all">
              {{ source.baseUrl }}
            </p>
            <p class="text-sm text-gray-400">
              源组：{{ source.groupName
              }}{{
                source.createdAt
                  ? " · 创建于 " + formatDate(source.createdAt)
                  : ""
              }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <mdui-button variant="outlined" @click="openEditDialog(source)">
              <mdui-icon-edit slot="icon"></mdui-icon-edit>
              修改
            </mdui-button>
            <mdui-button variant="text" @click="confirmDelete(source)">
              <mdui-icon-delete slot="icon"></mdui-icon-delete>
              删除
            </mdui-button>
          </div>
        </div>
        <mdui-divider class="my-4"></mdui-divider>
        <div class="flex flex-wrap justify-between items-center align-middle">
          <div>
            <span class="text-lg">启用</span>
          </div>
          <mdui-switch
            @change="toggleSource(source)"
            :checked="source.enabled"
          ></mdui-switch>
        </div>
      </mdui-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { dialog } from "mdui/functions/dialog.js";
import { confirm } from "mdui";
import { snackbar } from "mdui";
import {
  getSources,
  createSource,
  updateSource,
  deleteSource,
} from "../services/api";
import type { ReleaseSource } from "../types";

import "@mdui/icons/add";
import "@mdui/icons/edit";
import "@mdui/icons/delete";
import "@mdui/icons/cloud-off";

useHead({
  title: "下载源管理",
});

const sources = ref<ReleaseSource[]>([]);
const isLoading = ref(true);

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("zh-CN");
}

onMounted(() => {
  void loadSources();
});

async function loadSources() {
  isLoading.value = true;
  try {
    const response = await getSources();
    const rawData = response?.data ?? response ?? [];
    sources.value = (Array.isArray(rawData) ? rawData : []) as ReleaseSource[];
  } catch (error) {
    console.error("加载下载源失败:", error);
    snackbar({ message: "加载下载源失败" });
  } finally {
    isLoading.value = false;
  }
}

async function toggleSource(source: ReleaseSource) {
  try {
    await updateSource(source.id, { enabled: !source.enabled });
    source.enabled = !source.enabled;
    snackbar({ message: source.enabled ? "已启用此下载源" : "已禁用此下载源" });
  } catch (error) {
    console.error("更新下载源状态失败:", error);
    snackbar({ message: "更新下载源状态失败" });
  }
}

function openCreateDialog() {
  openSourceDialog();
}

function openEditDialog(source: ReleaseSource) {
  openSourceDialog(source);
}

function openSourceDialog(initial?: ReleaseSource) {
  const body = document.createElement("div");
  body.className = "space-y-4 py-4";
  body.innerHTML = `
    <mdui-text-field required id="source-name" label="名称" placeholder="GitHub 镜像"></mdui-text-field>
    <mdui-text-field required id="source-url" label="基础 URL" placeholder="https://mirror.example.com" helper="不含 /static/raw/ 后缀"></mdui-text-field>
    <mdui-text-field required id="source-group" label="源组" placeholder="cdn" helper="同一组的源会同时列在下载链接中"></mdui-text-field>
  `;

  const nameField = body.querySelector("#source-name") as any;
  const urlField = body.querySelector("#source-url") as any;
  const groupField = body.querySelector("#source-group") as any;

  if (initial) {
    nameField.value = initial.name;
    urlField.value = initial.baseUrl;
    groupField.value = initial.groupName;
  }

  dialog({
    headline: initial ? "修改下载源" : "新增下载源",
    body,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    actions: [
      {
        text: "取消",
      },
      {
        text: initial ? "保存" : "创建",
        onClick: () => {
          const name = String(nameField.value ?? "").trim();
          const baseUrl = String(urlField.value ?? "").trim();
          const groupName = String(groupField.value ?? "").trim();

          if (!name || !baseUrl || !groupName) {
            return false;
          }

          return (async () => {
            if (initial) {
              await updateSource(initial.id, { name, baseUrl, groupName });
            } else {
              await createSource({ name, baseUrl, groupName });
            }
            await loadSources();
            snackbar({
              message: initial ? "下载源已更新" : "下载源已创建",
            });
          })().catch((error) => {
            console.error(
              initial ? "修改下载源失败:" : "创建下载源失败:",
              error,
            );
            snackbar({
              message: initial ? "修改下载源失败" : "创建下载源失败",
            });
            throw error;
          });
        },
      },
    ],
  });
}

function confirmDelete(source: ReleaseSource) {
  const body = document.createElement("div");
  body.className = "space-y-2 py-2";
  body.innerHTML = `
    <p>确定要删除这个下载源吗？</p>
    <p class="text-sm text-gray-500 break-all">${source.name} · ${source.baseUrl}</p>
  `;

  confirm({
    headline: "删除下载源",
    description: `确定要删除下载源 "${source.name}" 吗？此操作无法撤销。`,
    closeOnEsc: true,
    closeOnOverlayClick: true,
    onConfirm: async () => {
      try {
        await deleteSource(source.id);
        await loadSources();
        snackbar({ message: "下载源已删除" });
      } catch (error) {
        console.error("删除下载源失败:", error);
        snackbar({ message: "删除下载源失败" });
        throw error;
      }
    },
    confirmText: "删除",
    cancelText: "取消",
  });
}
</script>
