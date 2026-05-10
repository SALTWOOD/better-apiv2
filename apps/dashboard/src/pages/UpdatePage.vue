<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <h1 class="text-3xl font-bold">更新管理</h1>
      <div class="flex flex-wrap items-end gap-3">
        <Button variant="secondary" @click="openUploadDialog">
          <Upload :size="18" />
          上传新版本
        </Button>
        <Button @click="openBatchDialog">
          <CloudUpload :size="18" />
          批量发版
        </Button>
      </div>
    </div>

    <Select :model-value="selectedChannel" @update:model-value="handleChannelChange">
      <SelectTrigger class="w-56">
        <SelectValue placeholder="筛选渠道" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">全部渠道</SelectItem>
        <SelectItem value="frarm64">FR ARM64</SelectItem>
        <SelectItem value="frx64">FR X64</SelectItem>
        <SelectItem value="srarm64">SR ARM64</SelectItem>
        <SelectItem value="srx64">SR X64</SelectItem>
      </SelectContent>
    </Select>

    <div v-if="isUpdatesLoading" class="py-12 text-center">
      <Loader2 class="mx-auto h-8 w-8 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">
        别着急，坐和放宽<br />正在加载更新列表
      </p>
    </div>

    <div v-else-if="filteredUpdates.length === 0" class="py-12 text-center">
      <PackageX class="mx-auto mb-3 h-12 w-12 text-muted-foreground" :size="48" />
      <p class="text-sm text-muted-foreground">没有已发布的更新</p>
    </div>

    <div v-else class="space-y-4">
      <Card v-for="update in paginatedUpdates" :key="update.id">
        <CardContent class="space-y-4 p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 space-y-2">
              <div class="flex flex-wrap items-start gap-2">
                <h3 class="text-base font-semibold">{{ update.versionName }}</h3>
                <span class="text-base text-muted-foreground">
                  {{ getChannelLabel(update.channel) }}
                </span>
              </div>
              <p class="break-all text-sm text-muted-foreground">
                文件名: {{ update.fileName }} | 版本号: {{ update.versionCode }} |
                发布时间: {{ formatDate(update.updateTime) }}
              </p>
              <p class="break-all text-sm text-muted-foreground">
                SHA256: {{ update.sha256 || "未填写" }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button variant="outline" @click="openEditDialog(update)">
                <Pencil :size="18" />
                修改
              </Button>
              <Button variant="ghost" class="text-destructive hover:text-destructive" @click="openDeleteDialog(update)">
                <Trash2 :size="18" />
                删除
              </Button>
            </div>
          </div>

          <Separator />

          <Collapsible>
            <CollapsibleTrigger class="flex w-full items-center gap-2 rounded p-2 hover:bg-muted">
              <Lightbulb :size="18" />
              <span class="flex-1 text-left">此版本的更新日志</span>
              <ChevronDown :size="18" />
            </CollapsibleTrigger>
            <CollapsibleContent class="mt-4">
              <div
                v-html="md.render(update.changelog) || '暂无更新日志'"
                class="prose prose-sm max-w-none dark:prose-invert"
              ></div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p class="text-sm text-muted-foreground">
          第 {{ currentPage }} / {{ totalPages }} 页，每页 {{ pageSize }} 个
        </p>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" :disabled="currentPage === 1" @click="goToPreviousPage">
            上一页
          </Button>
          <Button variant="outline" :disabled="currentPage === totalPages" @click="goToNextPage">
            下一页
          </Button>
        </div>
      </div>
    </div>

    <Dialog :open="isEditDialogOpen" @update:open="handleEditDialogOpenChange">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingUpdate ? "修改更新" : "上传新版本" }}</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-2">
          <div v-if="!editingUpdate" class="space-y-2">
            <Label>EXE 文件</Label>
            <Input type="file" accept=".exe,.zip,application/octet-stream" @change="handleFileSelect" />
            <p class="text-xs text-muted-foreground">请选择完整 EXE 文件。</p>
          </div>

          <div class="space-y-2">
            <Label>文件名</Label>
            <Input v-model="formFileName" :readonly="!!editingUpdate" placeholder="PCL2_CE_Beta_x64.exe" />
          </div>

          <div class="space-y-2">
            <Label>版本名称</Label>
            <Input v-model="formVersionName" placeholder="2.14.5-beta.1.2147483647" />
          </div>

          <div class="space-y-2">
            <Label>版本号</Label>
            <Input v-model="formVersionCode" type="number" placeholder="510" />
          </div>

          <div class="space-y-2">
            <Label>渠道</Label>
            <Select v-model="formChannel">
              <SelectTrigger>
                <SelectValue placeholder="选择渠道" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frarm64">Beta / 测试版 ARM64</SelectItem>
                <SelectItem value="frx64">Beta / 测试版 X64</SelectItem>
                <SelectItem value="srarm64">Release / 正式版 ARM64</SelectItem>
                <SelectItem value="srx64">Release / 正式版 X64</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>更新日志</Label>
            <Textarea v-model="formChangelog" rows="6" placeholder="支持 Markdown" />
          </div>

          <div class="space-y-2">
            <Label>下载源组</Label>
            <Input v-model="formSourceGroup" placeholder="cdn" />
            <p class="text-xs text-muted-foreground">可选，用于多CDN镜像分发。</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="closeEditDialog">取消</Button>
          <Button :disabled="isSaving" @click="handleSaveEdit">
            <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingUpdate ? "保存" : "上传" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog :open="isBatchDialogOpen" @update:open="handleBatchDialogOpenChange">
      <DialogContent class="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>批量发版</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-2">
          <p class="text-sm text-muted-foreground">一次上传多个文件，每个文件必须放入对应通道的输入框。</p>
          <Separator />

          <div v-for="cfg in channelConfigs" :key="cfg.channel" class="space-y-1">
            <Label>{{ cfg.label }}</Label>
            <Input type="file" accept=".exe,.zip" @change="(event: Event) => handleBatchFileSelect(event, cfg.channel)" />
          </div>

          <Separator />

          <div class="space-y-2">
            <Label>版本名称</Label>
            <Input v-model="batchVersionName" placeholder="2.14.5-beta.1.2147483647" />
          </div>

          <div class="space-y-2">
            <Label>版本号</Label>
            <Input v-model="batchVersionCode" type="number" placeholder="510" />
          </div>

          <div class="space-y-2">
            <Label>更新日志</Label>
            <Textarea v-model="batchChangelog" rows="6" placeholder="支持 Markdown" />
          </div>

          <div class="space-y-2">
            <Label>下载源组</Label>
            <Input v-model="batchSourceGroup" placeholder="cdn" />
            <p class="text-xs text-muted-foreground">可选，用于多CDN镜像分发。</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isBatchSaving" @click="closeBatchDialog">取消</Button>
          <Button :disabled="isBatchSaving" @click="handleSaveBatch">
            <Loader2 v-if="isBatchSaving" class="mr-2 h-4 w-4 animate-spin" />
            上传
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="isDeleteOpen" @update:open="handleDeleteOpenChange">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除更新</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除 {{ deletingUpdate?.channel }} 通道的更新 "{{ deletingUpdate?.versionName }}" 吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
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
import { computed, onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import markdownIt from "markdown-it";
import { toast } from "vue-sonner";
import { Loader2, Upload, CloudUpload, PackageX, Lightbulb, ChevronDown, Pencil, Trash2 } from "lucide-vue-next";
import { deleteUpdate, getUpdates, updateUpdate, uploadUpdate, batchUploadUpdates } from "../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AcceptableValue } from "reka-ui";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

useHead({
  title: "更新管理",
});

type UpdateChannel = "frarm64" | "frx64" | "srarm64" | "srx64";

type UpdateItem = {
  id: string;
  fileName: string;
  channel: UpdateChannel;
  versionName: string;
  versionCode: number;
  updateTime: string;
  downloads: string[];
  patches: string[];
  sha256: string;
  changelog: string;
  sourceGroup?: string;
};

type UpdateAssetResponse = {
  id?: string;
  file_name?: string;
  version?: {
    channel?: string;
    name?: string;
    code?: number;
  };
  upd_time?: string;
  updateTime?: string;
  downloads?: string[];
  patches?: string[];
  sha256?: string;
  changelog?: string;
  source_group?: string;
  sourceGroup?: string;
};

const pageSize = 8;
const channelOptions: Array<{ value: "all" | UpdateChannel; label: string }> = [
  { value: "all", label: "全部渠道" },
  { value: "frarm64", label: "FR ARM64" },
  { value: "frx64", label: "FR X64" },
  { value: "srarm64", label: "SR ARM64" },
  { value: "srx64", label: "SR X64" },
];

const channelConfigs: Array<{ channel: UpdateChannel; label: string }> = [
  { channel: "frarm64", label: "Beta ARM64 (frarm64)" },
  { channel: "frx64", label: "Beta X64 (frx64)" },
  { channel: "srarm64", label: "Release ARM64 (srarm64)" },
  { channel: "srx64", label: "Release X64 (srx64)" },
];

const updates = ref<UpdateItem[]>([]);
const isUpdatesLoading = ref(true);
const selectedChannel = ref<"all" | UpdateChannel>("all");
const currentPage = ref(1);

const isEditDialogOpen = ref(false);
const editingUpdate = ref<UpdateItem | null>(null);
const isSaving = ref(false);
const formFileName = ref("");
const formVersionName = ref("");
const formVersionCode = ref("");
const formChannel = ref<UpdateChannel>("frarm64");
const formChangelog = ref("");
const formSourceGroup = ref("");
const selectedFile = ref<File | null>(null);

const isBatchDialogOpen = ref(false);
const isBatchSaving = ref(false);
const batchVersionName = ref("");
const batchVersionCode = ref("");
const batchChangelog = ref("");
const batchSourceGroup = ref("");
const batchFiles = ref<Record<UpdateChannel, File | null>>({
  frarm64: null,
  frx64: null,
  srarm64: null,
  srx64: null,
});

const isDeleteOpen = ref(false);
const deletingUpdate = ref<UpdateItem | null>(null);
const isDeleting = ref(false);

const filteredUpdates = computed(() => {
  if (selectedChannel.value === "all") {
    return updates.value;
  }

  return updates.value.filter((update) => update.channel === selectedChannel.value);
});

const totalPages = computed(() => Math.ceil(filteredUpdates.value.length / pageSize));

const paginatedUpdates = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredUpdates.value.slice(start, start + pageSize);
});

onMounted(() => {
  void loadUpdates();
});

async function loadUpdates() {
  isUpdatesLoading.value = true;

  try {
    const response = (await getUpdates()) as { assets?: UpdateAssetResponse[] } | undefined;
    updates.value = (response?.assets ?? []).map(normalizeUpdateAsset);
    syncCurrentPage();
  } catch (error) {
    console.error("加载更新失败:", error);
    updates.value = [];
    toast.error("加载更新失败");
  } finally {
    isUpdatesLoading.value = false;
  }
}

function normalizeUpdateAsset(asset: UpdateAssetResponse): UpdateItem {
  const version = asset.version ?? {};
  const channel = normalizeChannel(version.channel);

  return {
    id: asset.id ?? crypto.randomUUID(),
    fileName: asset.file_name ?? "",
    channel,
    versionName: version.name ?? "",
    versionCode: version.code ?? 0,
    updateTime: asset.upd_time ?? asset.updateTime ?? new Date().toISOString(),
    downloads: Array.isArray(asset.downloads) ? asset.downloads : [],
    patches: Array.isArray(asset.patches) ? asset.patches : [],
    sha256: asset.sha256 ?? "",
    changelog: asset.changelog ?? "",
    sourceGroup: asset.source_group ?? asset.sourceGroup ?? "",
  };
}

function normalizeChannel(value?: string): UpdateChannel {
  const lower = String(value ?? "frarm64").toLowerCase();
  if (lower === "frx64" || lower === "srarm64" || lower === "srx64") {
    return lower;
  }

  return "frarm64";
}

function getChannelLabel(channel: UpdateChannel) {
  const option = channelOptions.find((item) => item.value === channel);
  return option?.label ?? channel;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("zh-CN");
}

function handleChannelChange(value: AcceptableValue) {
  const strValue = String(value ?? "all");
  selectedChannel.value = strValue === "all" ? "all" : normalizeChannel(strValue);
  currentPage.value = 1;
  syncCurrentPage();
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
}

function syncCurrentPage() {
  const safeTotalPages = totalPages.value;
  if (safeTotalPages <= 0) {
    currentPage.value = 1;
    return;
  }

  if (currentPage.value > safeTotalPages) {
    currentPage.value = safeTotalPages;
  }
}

function resetEditForm(update: UpdateItem | null) {
  editingUpdate.value = update;
  selectedFile.value = null;
  formFileName.value = update?.fileName ?? "";
  formVersionName.value = update?.versionName ?? "";
  formVersionCode.value = update?.versionCode ? String(update.versionCode) : "";
  formChannel.value = update?.channel ?? "frarm64";
  formChangelog.value = update?.changelog ?? "";
  formSourceGroup.value = update?.sourceGroup ?? "";
}

function openUploadDialog() {
  resetEditForm(null);
  isEditDialogOpen.value = true;
}

function openEditDialog(update: UpdateItem) {
  resetEditForm(update);
  isEditDialogOpen.value = true;
}

function handleEditDialogOpenChange(open: boolean) {
  isEditDialogOpen.value = open;
  if (!open) {
    closeEditDialog();
  }
}

function closeEditDialog() {
  isEditDialogOpen.value = false;
  editingUpdate.value = null;
  selectedFile.value = null;
  isSaving.value = false;
  formFileName.value = "";
  formVersionName.value = "";
  formVersionCode.value = "";
  formChannel.value = "frarm64";
  formChangelog.value = "";
  formSourceGroup.value = "";
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement | null;
  selectedFile.value = target?.files?.[0] ?? null;

  if (selectedFile.value && !formFileName.value.trim()) {
    formFileName.value = selectedFile.value.name;
  }
}

async function handleSaveEdit() {
  const fileName = formFileName.value.trim();
  const versionName = formVersionName.value.trim();
  const versionCodeRaw = formVersionCode.value.trim();
  const versionCode = Number(versionCodeRaw);
  const changelog = formChangelog.value.trim();
  const sourceGroup = formSourceGroup.value.trim();

  if (!fileName || !versionName || !versionCodeRaw || Number.isNaN(versionCode) || !changelog) {
    return;
  }

  if (!editingUpdate.value && !selectedFile.value) {
    return;
  }

  isSaving.value = true;

  try {
    if (editingUpdate.value) {
      await updateUpdate(editingUpdate.value.id, {
        file_name: fileName,
        channel: formChannel.value,
        version_name: versionName,
        version_code: versionCode,
        changelog,
        source_group: sourceGroup || undefined,
      });
    } else {
      await uploadUpdate({
        file: selectedFile.value as File,
        file_name: fileName || selectedFile.value!.name,
        version: {
          channel: formChannel.value,
          name: versionName,
          code: versionCode,
        },
        changelog,
        source_group: sourceGroup || undefined,
      });
    }

    await loadUpdates();
    toast.success(editingUpdate.value ? "更新已保存" : "更新已上传");
    closeEditDialog();
  } catch (error) {
    console.error(editingUpdate.value ? "修改失败:" : "上传失败:", error);
    toast.error(editingUpdate.value ? "修改更新失败" : "上传更新失败");
  } finally {
    isSaving.value = false;
  }
}

function openBatchDialog() {
  resetBatchForm();
  isBatchDialogOpen.value = true;
}

function handleBatchDialogOpenChange(open: boolean) {
  isBatchDialogOpen.value = open;
  if (!open) {
    closeBatchDialog();
  }
}

function resetBatchForm() {
  isBatchSaving.value = false;
  batchVersionName.value = "";
  batchVersionCode.value = "";
  batchChangelog.value = "";
  batchSourceGroup.value = "";
  batchFiles.value = {
    frarm64: null,
    frx64: null,
    srarm64: null,
    srx64: null,
  };
}

function closeBatchDialog() {
  isBatchDialogOpen.value = false;
  resetBatchForm();
}

function handleBatchFileSelect(event: Event, channel: UpdateChannel) {
  const target = event.target as HTMLInputElement | null;
  batchFiles.value[channel] = target?.files?.[0] ?? null;
}

async function handleSaveBatch() {
  const versionName = batchVersionName.value.trim();
  const versionCodeRaw = batchVersionCode.value.trim();
  const versionCode = Number(versionCodeRaw);
  const changelog = batchChangelog.value.trim();
  const sourceGroup = batchSourceGroup.value.trim();
  const fileChannels = channelConfigs
    .map((cfg) => {
      const file = batchFiles.value[cfg.channel];
      return file ? { file, channel: cfg.channel } : null;
    })
    .filter((item): item is { file: File; channel: UpdateChannel } => item !== null);

  if (!versionName || !versionCodeRaw || Number.isNaN(versionCode) || !changelog) {
    return;
  }

  if (fileChannels.length === 0) {
    return;
  }

  isBatchSaving.value = true;

  try {
    await batchUploadUpdates({
      fileChannels,
      version_name: versionName,
      version_code: versionCode,
      changelog,
      source_group: sourceGroup || undefined,
    });

    await loadUpdates();
    toast.success(`批量发版完成，共上传 ${fileChannels.length} 个文件`);
    closeBatchDialog();
  } catch (error) {
    console.error("批量发版失败:", error);
    toast.error("批量发版失败");
  } finally {
    isBatchSaving.value = false;
  }
}

function openDeleteDialog(update: UpdateItem) {
  deletingUpdate.value = update;
  isDeleteOpen.value = true;
}

function handleDeleteOpenChange(open: boolean) {
  isDeleteOpen.value = open;
  if (!open) {
    deletingUpdate.value = null;
    isDeleting.value = false;
  }
}

async function handleDelete() {
  if (!deletingUpdate.value) {
    return;
  }

  isDeleting.value = true;

  try {
    await deleteUpdate(deletingUpdate.value.id);
    await loadUpdates();
    toast.success("更新已删除");
    isDeleteOpen.value = false;
    deletingUpdate.value = null;
  } catch (error) {
    console.error("删除更新失败:", error);
    toast.error("删除更新失败");
  } finally {
    isDeleting.value = false;
  }
}
</script>
