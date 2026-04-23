import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { guest: true }
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue'),
            meta: { guest: true }
        },
        {
            path: '/',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/kols',
            name: 'kols',
            component: () => import('../views/KolsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/restaurants',
            name: 'restaurants',
            component: () => import('../views/RestaurantsView.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

// Route guard: bảo vệ các trang cần đăng nhập
router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('token')
    const isAuthenticated = !!token

    if (to.meta.requiresAuth && !isAuthenticated) {
        // Chưa đăng nhập → về trang login
        next({ name: 'login' })
    } else if (to.meta.guest && isAuthenticated) {
        // Đã đăng nhập rồi mà vào trang login/register → về dashboard
        next({ name: 'dashboard' })
    } else {
        next()
    }
})

export default router

