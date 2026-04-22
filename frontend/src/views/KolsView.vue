<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus, ExternalLink, MessageSquare } from 'lucide-vue-next'

interface Kol {
  id: string
  name: string
  username: string
  platform: string
  followers: string
  specialty: string
  avatar: string
}

const kols = ref<Kol[]>([
  {
    id: '1',
    name: 'Foodie Mike',
    username: '@mike_eats',
    platform: 'TikTok',
    followers: '1.2M',
    specialty: 'Street Food',
    avatar: 'https://i.pravatar.cc/150?u=mike'
  },
  {
    id: '2',
    name: 'Sarah Kitchen',
    username: '@sarah_cooks',
    platform: 'Instagram',
    followers: '850K',
    specialty: 'Fine Dining',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: '3',
    name: 'Chef Vinh',
    username: '@vinh_chef',
    platform: 'Facebook',
    followers: '500K',
    specialty: 'Traditional Vietnamese',
    avatar: 'https://i.pravatar.cc/150?u=vinh'
  }
])
</script>

<template>
  <div class="space-y-6">
    <header class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-slate-800">KOLs</h2>
        <p class="text-slate-500">Connect with influencers for your restaurant.</p>
      </div>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-indigo-700 transition">
        <Plus class="w-5 h-5" />
        <span>Add KOL</span>
      </button>
    </header>

    <div class="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b bg-slate-50 flex items-center justify-between">
        <div class="relative w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search KOLs by name or platform..." 
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th class="px-6 py-4">KOL</th>
              <th class="px-6 py-4">Platform</th>
              <th class="px-6 py-4">Followers</th>
              <th class="px-6 py-4">Specialty</th>
              <th class="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="kol in kols" :key="kol.id" class="hover:bg-slate-50 transition group">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <img :src="kol.avatar" class="w-10 h-10 rounded-full border" />
                  <div>
                    <p class="font-bold text-slate-800">{{ kol.name }}</p>
                    <p class="text-xs text-slate-500">{{ kol.username }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                  {{ kol.platform }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ kol.followers }}</td>
              <td class="px-6 py-4 text-slate-600">{{ kol.specialty }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <button class="text-slate-400 hover:text-indigo-600 transition">
                    <MessageSquare class="w-5 h-5" />
                  </button>
                  <button class="text-slate-400 hover:text-slate-600 transition">
                    <ExternalLink class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
