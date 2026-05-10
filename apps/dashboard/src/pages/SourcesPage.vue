<template>
  <div class="space-y-4">
    <div class="flex flex-wrap justify-between items-start gap-4">
      <div>
        <h1 class="text-3xl font-bold">下载源管理</h1>
        <p class="text-sm text-gray-500">
          配置多 CDN 镜像源，为更新文件提供多个下载地址
        </p>
      </div>
      <Button @click="openCreateDialog">
        <Plus :size="18" />
        新增下载源
      </Button>
    </div>

    <div class="text-center py-12" v-if="isLoading">
      <Loader2 class="mx-auto h-8 w-8 animate-spin text-primary" />
      <p class="text-sm text-gray-500">正在加载下载源列表</p>
    </div>

    <div class="text-center py-12" v-else-if="sources.length === 0">
      <CloudOff :size="48" class="mx-auto text-muted-foreground" />
      <p class="text-sm text-gray-500">暂无下载源配置</p>
    </div>

    <div v-else class="space-y-3">
      <Card v-for="source in sources" :key="source.id" class="w-full">
        <CardContent class="p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 space-y-1">
              <div class="flex flex-wrap items-start gap-2">
                <h3 class="text-lg font-semibold">{{ source.name }}</h3>
              </div>
              <p class="text-base text-gray-600 break-all">
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
              <Button variant="outline" @click="openEditDialog(source)">
                <Pencil :size="18" />
                修改
              </Button>
              <Button
                variant="ghost"
                class="text-destructive hover:text-destructive"
                @click="confirmDelete(source)"
              >
                <Trash2 :size="18" />
                删除
              </Button>
            </div>
          </div>
          <Separator class="my-4" />
          <div class="flex flex-wrap justify-between items-center align-middle">
            <div>
              <span class="text-lg">启用</span>
            </div>
            <Switch
              :checked="source.enabled"
              @update:checked="toggleSource(source)"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog :open="isDialogOpen" @update:open="handleDialogClose">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingSource ? "修改下载源" : "新增下载源" }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="source-name">名称</Label>
            <Input id="source-name" v-model="formName" placeholder="GitHub 镜像" />
          </div>
          <div class="space-y-2">
            <Label for="source-url">基础 URL</Label>
            <Input
              id="source-url"
              v-model="formUrl"
              placeholder="https://mirror.example.com"
            />
            <p class="text-xs text-muted-foreground">不含 /static/raw/ 后缀</p>
          </div>
          <div class="space-y-2">
            <Label for="source-group">源组</Label>
            <Input id="source-group" v-model="formGroup" placeholder="cdn" />
            <p class="text-xs text-muted-foreground">同一组的源会同时列在下载链接中</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="handleDialogClose(false)">取消</Button>
          <Button :disabled="isSaving" @click="handleSave">
            <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingSource ? "保存" : "创建" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="isDeleteOpen" @update:open="handleDeleteDialogClose">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除下载源</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除下载源 "{{ deletingSource?.name }}" 吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting">取消</AlertDialogCancel>
          <AlertDialogAction :disabled="isDeleting" @click="handleDelete">
            <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CloudOff, Loader2, Pencil, Plus, Trash2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import {
  getSources,
  createSource,
  updateSource,
  deleteSource,
} from "../services/api";
import type { ReleaseSource } from "../types";

useHead({
  title: "下载源管理",
});

const sources = ref<ReleaseSource[]>([]);
const isLoading = ref(true);
const isDialogOpen = ref(false);
const editingSource = ref<ReleaseSource | null>(null);
const isSaving = ref(false);
const formName = ref("");
const formUrl = ref("");
const formGroup = ref("");
const isDeleteOpen = ref(false);
const deletingSource = ref<ReleaseSource | null>(null);
const isDeleting = ref(false);

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
    toast.error("加载下载源失败");
  } finally {
    isLoading.value = false;
  }
}

async function toggleSource(source: ReleaseSource) {
  try {
    await updateSource(source.id, { enabled: !source.enabled });
    source.enabled = !source.enabled;
    toast.success(source.enabled ? "已启用此下载源" : "已禁用此下载源");
  } catch (error) {
    console.error("更新下载源状态失败:", error);
    toast.error("更新下载源状态失败");
  }
}

function resetForm() {
  editingSource.value = null;
  formName.value = "";
  formUrl.value = "";
  formGroup.value = "";
}

function openCreateDialog() {
  resetForm();
  isDialogOpen.value = true;
}

function openEditDialog(source: ReleaseSource) {
  editingSource.value = source;
  formName.value = source.name;
  formUrl.value = source.baseUrl;
  formGroup.value = source.groupName;
  isDialogOpen.value = true;
}

function handleDialogClose(open: boolean) {
  isDialogOpen.value = open;
  if (!open) {
    resetForm();
  }
}

async function handleSave() {
  const name = formName.value.trim();
  const baseUrl = formUrl.value.trim();
  const groupName = formGroup.value.trim();

  if (!name || !baseUrl || !groupName) {
    toast.error("请填写完整信息");
    return;
  }

  isSaving.value = true;
  try {
    if (editingSource.value) {
      await updateSource(editingSource.value.id, { name, baseUrl, groupName });
    } else {
      await createSource({ name, baseUrl, groupName });
    }
    await loadSources();
    toast.success(editingSource.value ? "下载源已更新" : "下载源已创建");
    handleDialogClose(false);
  } catch (error) {
    console.error(editingSource.value ? "修改下载源失败:" : "创建下载源失败:", error);
    toast.error(editingSource.value ? "修改下载源失败" : "创建下载源失败");
  } finally {
    isSaving.value = false;
  }
}

function confirmDelete(source: ReleaseSource) {
  deletingSource.value = source;
  isDeleteOpen.value = true;
}

function handleDeleteDialogClose(open: boolean) {
  isDeleteOpen.value = open;
  if (!open) {
    deletingSource.value = null;
  }
}

async function handleDelete() {
  if (!deletingSource.value) {
    return;
  }

  isDeleting.value = true;
  try {
    await deleteSource(deletingSource.value.id);
    await loadSources();
    toast.success("下载源已删除");
    handleDeleteDialogClose(false);
  } catch (error) {
    console.error("删除下载源失败:", error);
    toast.error("删除下载源失败");
  } finally {
    isDeleting.value = false;
  }
}
</script>
