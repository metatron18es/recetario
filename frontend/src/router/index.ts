import { createRouter, createWebHistory } from 'vue-router'
import { obtenerSesion } from '../lib/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('../components/templates/tp-app-shell.vue'),
      children: [
        { path: '', redirect: { name: 'recetas' } },
        {
          path: 'recetas',
          name: 'recetas',
          component: () => import('../views/RecetasView.vue'),
        },
        {
          path: 'recetas/nueva',
          name: 'crear-receta',
          component: () => import('../views/CrearRecetaView.vue'),
        },
        {
          path: 'recetas/:id',
          name: 'detalle-receta',
          component: () => import('../views/DetalleRecetaView.vue'),
          props: (route) => ({ id: Number(route.params.id) }),
        },
        {
          path: 'recetas/:id/editar',
          name: 'editar-receta',
          component: () => import('../views/CrearRecetaView.vue'),
          props: (route) => ({ editId: Number(route.params.id) }),
        },
        {
          path: 'calendario',
          name: 'calendario',
          component: () => import('../views/CalendarioView.vue'),
        },
        {
          path: 'lista-compra',
          name: 'lista-compra',
          component: () => import('../views/ListaCompraView.vue'),
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('../views/PerfilView.vue'),
        },
      ],
    },
  ],
})

// US-04: al recargar se consulta la cookie; sin sesión válida se redirige a login.
router.beforeEach(async (to) => {
  const sesion = await obtenerSesion().catch(() => null)
  if (to.name === 'login') return sesion ? { path: '/recetas' } : true
  return sesion ? true : { name: 'login' }
})

export default router
