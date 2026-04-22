<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const stats = ref([
  { label: 'Total KOLs', value: '1,240', change: '+12%', icon: 'Users' },
  { label: 'Restaurants', value: '450', change: '+5%', icon: 'Utensils' },
  { label: 'Active Campaigns', value: '82', change: '+18%', icon: 'Zap' },
  { label: 'Total Engagement', value: '2.4M', change: '+25%', icon: 'Heart' }
])

const chartOption = ref({
  title: { text: 'Campaign Performance' },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  yAxis: { type: 'value' },
  series: [{
    data: [120, 200, 150, 80, 70, 110, 130],
    type: 'bar',
    itemStyle: { color: '#3b82f6' }
  }]
})
</script>

<template>
  <div class="space-y-8">
    <header>
      <h2 class="text-3xl font-bold text-slate-800">Dashboard</h2>
      <p class="text-slate-500">Welcome back! Here's what's happening today.</p>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl border shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
            <h3 class="text-2xl font-bold text-slate-800 mt-1">{{ stat.value }}</h3>
          </div>
          <span class="text-xs font-semibold px-2 py-1 rounded bg-green-50 text-green-600">
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white p-8 rounded-2xl border shadow-sm h-[400px]">
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
      <div class="bg-white p-8 rounded-2xl border shadow-sm h-[400px]">
         <div class="flex flex-col items-center justify-center h-full text-slate-400">
            <p>More detailed analytics coming soon...</p>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
