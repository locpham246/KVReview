<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'
import { LayoutDashboard, Users, UtensilsCrossed, Settings } from 'lucide-vue-next'

const router = useRouter()
const items = ref([
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        route: '/'
    },
    {
        label: 'KOLs',
        icon: Users,
        route: '/kols'
    },
    {
        label: 'Restaurants',
        icon: UtensilsCrossed,
        route: '/restaurants'
    }
])
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r flex flex-col">
      <div class="p-6 border-b">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          KVReview
        </h1>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <button
          v-for="item in items"
          :key="item.label"
          @click="router.push(item.route)"
          class="flex items-center space-x-3 w-full p-3 rounded-lg transition-colors hover:bg-slate-100 text-slate-600 font-medium"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="p-4 border-t">
        <button class="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-slate-100 text-slate-600 font-medium">
          <Settings class="w-5 h-5" />
          <span>Settings</span>
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
