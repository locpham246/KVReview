import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue')
        },
        {
            path: '/kols',
            name: 'kols',
            component: () => import('../views/KolsView.vue')
        },
        {
            path: '/restaurants',
            name: 'restaurants',
            component: () => import('../views/RestaurantsView.vue')
        }
    ]
})

export default router
