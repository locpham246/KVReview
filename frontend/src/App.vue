<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { LayoutDashboard, Users, UtensilsCrossed, LogOut } from 'lucide-vue-next'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAuthPage = computed(() => route.name === 'login' || route.name === 'register')

const items = ref([
    { label: 'Dashboard', icon: LayoutDashboard, route: '/' },
    { label: 'KOLs',      icon: Users,           route: '/kols' },
    { label: 'Restaurants', icon: UtensilsCrossed, route: '/restaurants' },
])

function logout() {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
  <!-- Trang login/register: không có sidebar -->
  <RouterView v-if="isAuthPage" />

  <!-- Các trang chính: có sidebar -->
  <div v-else class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r flex flex-col">
      <div class="p-6 border-b">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          KVReview
        </h1>
        <p class="text-xs text-slate-400 mt-1">KOL & Restaurant Platform</p>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <button
          v-for="item in items"
          :key="item.label"
          @click="router.push(item.route)"
          :class="[
            'flex items-center space-x-3 w-full p-3 rounded-lg transition-colors font-medium',
            $route.path === item.route
              ? 'bg-indigo-50 text-indigo-600'
              : 'hover:bg-slate-100 text-slate-600'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- User info & Logout -->
      <div class="p-4 border-t">
        <div class="flex items-center gap-3 mb-3 px-1">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ authStore.user?.name }}</p>
            <p class="text-xs text-slate-400 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <button
          @click="logout"
          id="logout-btn"
          class="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut class="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div class="max-w-7xl mx-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
/* Reset and global styles are in style.css */
</style>

