<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between">
      <h1 class="text-3xl font-bold">公告管理</h1>
      <Button @click="openCreateDialog">
        <Plus :size="18" />
        新增公告
      </Button>
    </div>

    <div v-if="isAnnouncementsLoading" class="py-12 text-center">
      <Loader2 class="mx-auto h-8 w-8 animate-spin text-primary" />
      <p class="mt-3 text-sm text-gray-500">别着急，坐和放宽<br />正在加载公告</p>
    </div>

    <div v-else-if="announcements.length === 0" class="py-12 text-center">
      <MessageSquareOff :size="48" class="mx-auto text-muted-foreground" />
      <p class="mt-3 text-sm text-gray-500">没有公告</p>
    </div>

    <div v-else class="space-y-4">
      <Card
        v-for="announcement in paginatedAnnouncements"
        :key="announcement.id"
        class="w-full cursor-pointer transition-colors hover:bg-muted/40"
        @click="editAnnouncement(announcement)"
      >
        <CardContent class="space-y-4 p-6">
          <div class="flex-1">
            <h3 class="font-semibold">{{ announcement.title }}</h3>
            <p>{{ announcement.details }}</p>
            <p class="text-sm text-gray-600">
              {{ formatDate(announcement.date) }}
            </p>
          </div>
          <Separator />
          <Button
            variant="ghost"
            class="mt-2"
            @click.stop="confirmDeletion(announcement)"
          >
            <Trash2 :size="18" />
            删除
          </Button>
        </CardContent>
      </Card>

      <div
        v-if="totalPages > 1"
        class="flex flex-wrap items-center justify-between gap-3 pt-2"
      >
        <p class="text-sm text-gray-500">
          第 {{ currentPage }} / {{ totalPages }} 页，每页 {{ pageSize }} 个
        </p>
        <div class="flex flex-wrap gap-2">
          <Button
            variant="outline"
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
          >
            上一页
          </Button>
          <Button
            variant="outline"
            :disabled="currentPage === totalPages"
            @click="goToNextPage"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>

    <Dialog :open="isDialogOpen" @update:open="handleDialogClose">
      <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingId ? "编辑公告" : "创建公告" }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label for="announcement-title" class="text-sm font-medium">标题</label>
            <Input
              id="announcement-title"
              v-model="formTitle"
              :aria-invalid="Boolean(validationErrors.title)"
            />
            <p v-if="validationErrors.title" class="text-sm text-destructive">
              {{ validationErrors.title }}
            </p>
          </div>

          <div class="space-y-2">
            <label for="announcement-details" class="text-sm font-medium">详情</label>
            <Textarea
              id="announcement-details"
              v-model="formDetails"
              :aria-invalid="Boolean(validationErrors.details)"
              class="min-h-24"
            />
            <p v-if="validationErrors.details" class="text-sm text-destructive">
              {{ validationErrors.details }}
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label for="announcement-priority" class="text-sm font-medium">优先级</label>
              <Input id="announcement-priority" v-model="formPriority" type="number" />
            </div>
            <div class="space-y-2">
              <label for="announcement-level" class="text-sm font-medium">等级</label>
              <Input id="announcement-level" v-model="formLevel" type="number" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <label class="block text-sm font-medium">跳过条件（可选）</label>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <label for="announcement-skip-min" class="text-sm font-medium">最小版本</label>
                <Input id="announcement-skip-min" v-model="formSkipMin" />
              </div>
              <div class="space-y-2">
                <label for="announcement-skip-max" class="text-sm font-medium">最大版本</label>
                <Input id="announcement-skip-max" v-model="formSkipMax" />
              </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <label for="announcement-skip-not-before" class="text-sm font-medium">开始时间</label>
                <Input id="announcement-skip-not-before" v-model="formSkipNotBefore" />
              </div>
              <div class="space-y-2">
                <label for="announcement-skip-not-after" class="text-sm font-medium">结束时间</label>
                <Input id="announcement-skip-not-after" v-model="formSkipNotAfter" />
              </div>
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <label class="block text-sm font-medium">按钮 1（可选）</label>
            <div class="space-y-2">
              <label for="announcement-button1-text" class="text-sm font-medium">按钮文字</label>
              <Input id="announcement-button1-text" v-model="formButton1Text" />
            </div>
            <div class="space-y-2">
              <label for="announcement-button1-exec" class="text-sm font-medium">执行动作</label>
              <Input id="announcement-button1-exec" v-model="formButton1Exec" />
            </div>
            <div class="space-y-2">
              <label for="announcement-button1-argument" class="text-sm font-medium">参数</label>
              <Input id="announcement-button1-argument" v-model="formButton1Argument" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <label class="block text-sm font-medium">按钮 2（可选）</label>
            <div class="space-y-2">
              <label for="announcement-button2-text" class="text-sm font-medium">按钮文字</label>
              <Input id="announcement-button2-text" v-model="formButton2Text" />
            </div>
            <div class="space-y-2">
              <label for="announcement-button2-exec" class="text-sm font-medium">执行动作</label>
              <Input id="announcement-button2-exec" v-model="formButton2Exec" />
            </div>
            <div class="space-y-2">
              <label for="announcement-button2-argument" class="text-sm font-medium">参数</label>
              <Input id="announcement-button2-argument" v-model="formButton2Argument" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="handleDialogClose(false)">
            取消
          </Button>
          <Button :disabled="isSaving" @click="handleSave">
            <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="isDeleteOpen" @update:open="isDeleteOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除公告 "{{ deletingAnnouncement?.title }}" 吗？此操作无法撤销。
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
import { computed, onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { Loader2, MessageSquareOff, Plus, Trash2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  createAnnouncement,
  deleteAnnouncement as deleteAnnouncementApi,
  getAnnouncements,
  updateAnnouncement,
} from "../services/api";

useHead({
  title: "公告管理",
});

type AnnouncementButtonResponse = {
  text: string;
  exec: string;
  argument: string;
};

type AnnouncementSkipResponse = {
  min?: string | null;
  max?: string | null;
  notBefore?: string | null;
  notAfter?: string | null;
};

type AnnouncementItem = {
  id: string;
  title: string;
  details: string;
  priority: number;
  level: number;
  date: string;
  skip?: AnnouncementSkipResponse | null;
  buttons: AnnouncementButtonResponse[];
};

type AnnouncementPayload = {
  title: string;
  details: string;
  priority: number;
  level: number;
  date: Date;
  skip: Required<AnnouncementSkipResponse> | null;
  buttons: AnnouncementButtonResponse[];
};

const announcements = ref<AnnouncementItem[]>([]);
const isAnnouncementsLoading = ref(true);

const pageSize = 8;
const currentPage = ref(1);

const isDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const editingAnnouncement = ref<AnnouncementItem | null>(null);
const isSaving = ref(false);

const formTitle = ref("");
const formDetails = ref("");
const formPriority = ref(0);
const formLevel = ref(0);
const formSkipMin = ref("");
const formSkipMax = ref("");
const formSkipNotBefore = ref("");
const formSkipNotAfter = ref("");
const formButton1Text = ref("");
const formButton1Exec = ref("OpenWebSite");
const formButton1Argument = ref("");
const formButton2Text = ref("");
const formButton2Exec = ref("OpenWebSite");
const formButton2Argument = ref("");
const validationErrors = ref({
  title: "",
  details: "",
});

const isDeleteOpen = ref(false);
const deletingAnnouncement = ref<AnnouncementItem | null>(null);
const isDeleting = ref(false);

const totalPages = computed(() => {
  return Math.ceil(announcements.value.length / pageSize);
});

const paginatedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return announcements.value.slice(start, start + pageSize);
});

async function loadAnnouncements() {
  isAnnouncementsLoading.value = true;
  try {
    const response = (await getAnnouncements()) as AnnouncementItem[] | undefined;
    announcements.value = response ?? [];
  } catch (error) {
    console.error("加载公告失败:", error);
    announcements.value = [];
    toast.error("加载公告失败");
  } finally {
    isAnnouncementsLoading.value = false;
    syncCurrentPage();
  }
}

onMounted(() => {
  void loadAnnouncements();
});

function formatDate(date: string) {
  return new Date(date.replace(" ", "T")).toLocaleDateString("zh-CN");
}

function openCreateDialog() {
  resetForm();
  editingId.value = null;
  editingAnnouncement.value = null;
  isDialogOpen.value = true;
}

function editAnnouncement(announcement: AnnouncementItem) {
  resetForm();
  const initialSkip = normalizeSkip(announcement.skip);
  const initialButton1 = normalizeButton(announcement.buttons?.[0]);
  const initialButton2 = normalizeButton(announcement.buttons?.[1]);

  editingId.value = announcement.id;
  editingAnnouncement.value = announcement;
  formTitle.value = announcement.title;
  formDetails.value = announcement.details;
  formPriority.value = announcement.priority;
  formLevel.value = announcement.level;
  formSkipMin.value = initialSkip?.min ?? "";
  formSkipMax.value = initialSkip?.max ?? "";
  formSkipNotBefore.value = initialSkip?.notBefore ?? "";
  formSkipNotAfter.value = initialSkip?.notAfter ?? "";
  formButton1Text.value = initialButton1?.text ?? "";
  formButton1Exec.value = initialButton1?.exec ?? "OpenWebSite";
  formButton1Argument.value = initialButton1?.argument ?? "";
  formButton2Text.value = initialButton2?.text ?? "";
  formButton2Exec.value = initialButton2?.exec ?? "OpenWebSite";
  formButton2Argument.value = initialButton2?.argument ?? "";
  isDialogOpen.value = true;
}

function handleDialogClose(open: boolean) {
  isDialogOpen.value = open;
  if (!open) {
    resetForm();
  }
}

function resetForm() {
  editingId.value = null;
  editingAnnouncement.value = null;
  isSaving.value = false;
  formTitle.value = "";
  formDetails.value = "";
  formPriority.value = 0;
  formLevel.value = 0;
  formSkipMin.value = "";
  formSkipMax.value = "";
  formSkipNotBefore.value = "";
  formSkipNotAfter.value = "";
  formButton1Text.value = "";
  formButton1Exec.value = "OpenWebSite";
  formButton1Argument.value = "";
  formButton2Text.value = "";
  formButton2Exec.value = "OpenWebSite";
  formButton2Argument.value = "";
  validationErrors.value = {
    title: "",
    details: "",
  };
}

function normalizeButton(
  button?: AnnouncementButtonResponse | null,
): AnnouncementButtonResponse | null {
  if (!button) return null;

  return {
    text: button.text ?? "",
    exec: button.exec ?? "OpenWebSite",
    argument: button.argument ?? "",
  };
}

function normalizeSkip(skip?: AnnouncementSkipResponse | null) {
  if (!skip) {
    return null;
  }

  return {
    min: skip.min ?? "",
    max: skip.max ?? "",
    notBefore: skip.notBefore ?? "",
    notAfter: skip.notAfter ?? "",
  };
}

function readButton(
  textValue: string,
  execValue: string,
  argumentValue: string,
): AnnouncementButtonResponse | null {
  const text = textValue.trim();
  const exec = execValue.trim();
  const argument = argumentValue.trim();

  if (!text && !exec && !argument) {
    return null;
  }

  return {
    text,
    exec: exec || "OpenWebSite",
    argument,
  };
}

function readSkip(): Required<AnnouncementSkipResponse> | null {
  const min = formSkipMin.value.trim();
  const max = formSkipMax.value.trim();
  const notBefore = formSkipNotBefore.value.trim();
  const notAfter = formSkipNotAfter.value.trim();

  if (!min && !max && !notBefore && !notAfter) {
    return null;
  }

  return {
    min: min || null,
    max: max || null,
    notBefore: notBefore || null,
    notAfter: notAfter || null,
  };
}

function validateForm() {
  const title = formTitle.value.trim();
  const details = formDetails.value.trim();

  validationErrors.value = {
    title: title ? "" : "标题不能为空",
    details: details ? "" : "详情不能为空",
  };

  return Boolean(title && details);
}

function buildPayload(): AnnouncementPayload {
  const priority = Number(formPriority.value);
  const level = Number(formLevel.value);
  const button1 = readButton(
    formButton1Text.value,
    formButton1Exec.value,
    formButton1Argument.value,
  );
  const button2 = readButton(
    formButton2Text.value,
    formButton2Exec.value,
    formButton2Argument.value,
  );
  const buttons = [button1, button2].filter(
    (button): button is AnnouncementButtonResponse => Boolean(button),
  );

  return {
    title: formTitle.value.trim(),
    details: formDetails.value.trim(),
    priority: Number.isFinite(priority) ? priority : 0,
    level: Number.isFinite(level) ? level : 0,
    date: editingAnnouncement.value?.date
      ? new Date(editingAnnouncement.value.date)
      : new Date(),
    skip: readSkip(),
    buttons,
  };
}

async function handleSave() {
  if (isSaving.value || !validateForm()) {
    return;
  }

  isSaving.value = true;
  try {
    const payload = buildPayload();
    if (editingId.value) {
      await updateAnnouncement(editingId.value, payload);
      toast.success("公告更新成功");
    } else {
      await createAnnouncement(payload);
      toast.success("公告创建成功");
    }

    await loadAnnouncements();
    isDialogOpen.value = false;
    resetForm();
  } catch (error) {
    console.error("保存失败:", error);
    toast.error("保存公告失败");
  } finally {
    isSaving.value = false;
  }
}

function confirmDeletion(announcement: AnnouncementItem) {
  deletingAnnouncement.value = announcement;
  isDeleteOpen.value = true;
}

async function handleDelete() {
  if (!deletingAnnouncement.value || isDeleting.value) {
    return;
  }

  isDeleting.value = true;
  try {
    await deleteAnnouncementApi(deletingAnnouncement.value.id);
    announcements.value = announcements.value.filter(
      (announcement) => announcement.id !== deletingAnnouncement.value?.id,
    );
    syncCurrentPage();
    toast.success("删除公告成功");
    isDeleteOpen.value = false;
    deletingAnnouncement.value = null;
  } catch (error) {
    console.error("删除失败:", error);
    toast.error("删除公告失败");
  } finally {
    isDeleting.value = false;
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
</script>
