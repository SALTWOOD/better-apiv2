import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from '@unhead/vue/client'
import "uno.css";
import "mdui";
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
    .then((res: any) => {
      if (res.error || res.status === 401) {
        authStore.logout();
        if (isClient) {
          window.location.href = '/login';
        }
        return;
      }
      
      const user =
        res && res.user ? res.user : res && res.data ? res.data.user : null;
      if (user) authStore.setUser(user);
    })
    .catch(() => {
      authStore.logout();
      if (isClient) {
        window.location.href = '/login';
      }
    });
}

app.mount("#app");
