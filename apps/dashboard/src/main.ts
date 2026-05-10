import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from '@unhead/vue/client'
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import { api, getAuthRequestOptions } from "./services/api";
import { isClient } from "@vueuse/core";

const app = createApp(App);
const pinia = createPinia();
const head = createHead()

app.use(head)
app.use(pinia);
app.use(router);

const authStore = useAuthStore(pinia);
if (authStore.token) {
  api.admin.me
    .get(getAuthRequestOptions(authStore.token))
    .then((res) => {
      if (res.error || res.status === 401) {
        authStore.logout();
        if (isClient) {
          window.location.href = '/login';
        }
        return;
      }
      
      // Eden client response shape varies; extract user from possible response shapes
      const data = res as { user?: Record<string, unknown>; data?: { user?: Record<string, unknown> } };
      const user = data.user ?? data.data?.user ?? null;
      if (user) authStore.setUser(user as unknown as Parameters<typeof authStore.setUser>[0]);
    })
    .catch(() => {
      authStore.logout();
      if (isClient) {
        window.location.href = '/login';
      }
    });
}

app.mount("#app");
