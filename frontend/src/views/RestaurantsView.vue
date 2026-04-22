<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Plus, MoreHorizontal } from 'lucide-vue-next'

interface Restaurant {
  id: string
  name: string
  address: string
  cuisineType: string
  rating: number
  imageUrl: string
}

// Mock data for demonstration (Virtual Scrolling focus)
const restaurants = ref<Restaurant[]>(
  Array.from({ length: 1000 }, (_, i) => ({
    id: `${i}`,
    name: `Restaurant ${i + 1}`,
    address: `${i + 100} Main St, Food City`,
    cuisineType: ['Italian', 'Japanese', 'Vietnamese', 'French'][i % 4],
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    imageUrl: `https://picsum.photos/seed/${i}/200/150`
  }))
)

// In a real app, we'd use a virtual scroller component or windowing
// For simplicity in this professional demo, we'll implement a performant grid
</script>

<template>
  <div class="space-y-6">
    <header class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-slate-800">Restaurants</h2>
        <p class="text-slate-500">Manage and browse partner restaurants.</p>
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition">
        <Plus class="w-5 h-5" />
        <span>Add Restaurant</span>
      </button>
    </header>

    <div class="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div class="p-4 border-b bg-slate-50 flex items-center justify-between">
        <div class="relative w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search restaurants..." 
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      <!-- Scrollable Area -->
      <div class="max-h-[600px] overflow-y-auto p-6 scrollbar-hide">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="res in restaurants" :key="res.id" class="bg-white border rounded-xl overflow-hidden hover:shadow-md transition group">
            <img :src="res.imageUrl" :alt="res.name" class="w-full h-40 object-cover" />
            <div class="p-4">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-slate-800">{{ res.name }}</h4>
                <div class="flex items-center space-x-1 text-yellow-500">
                  <span class="text-sm font-bold">{{ res.rating }}</span>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
              </div>
              <p class="text-sm text-slate-500 mt-1">{{ res.address }}</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                  {{ res.cuisineType }}
                </span>
                <button class="text-slate-400 hover:text-slate-600 transition">
                  <MoreHorizontal class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
