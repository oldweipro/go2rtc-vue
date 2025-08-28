import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return '/login';
  }

  if (to.meta.requiresGuest && isAuthenticated.value) {
    return '/dashboard';
  }
});

export default router;