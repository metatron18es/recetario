<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { cerrarSesion, getApiHealth } from '../../lib/api'
import { sesion } from '../../lib/sesion'
import TpAvatar from '../atoms/tp-avatar.vue'
import TpIcon from '../atoms/tp-icon.vue'
import TpBrand from '../molecules/tp-brand.vue'

const secciones = [
  { to: '/recetas', texto: 'Mis recetas', corto: 'Recetas', icono: 'recetas' },
  { to: '/calendario', texto: 'Calendario', corto: 'Calendario', icono: 'calendario' },
  { to: '/lista-compra', texto: 'Lista de la compra', corto: 'Compra', icono: 'compra' },
]

// Solo en desarrollo: comprobación simple de que el backend Express responde.
const esDev = import.meta.env.DEV
const apiStatus = ref<'comprobando' | 'conectado' | 'sin conexión'>('comprobando')

// Menú del avatar: se cierra al pulsar fuera, con Escape o al navegar.
const route = useRoute()
const router = useRouter()
const menuAbierto = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function cerrarSiFuera(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) menuAbierto.value = false
}
function cerrarConEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') menuAbierto.value = false
}
watch(() => route.fullPath, () => (menuAbierto.value = false))

async function salir() {
  menuAbierto.value = false
  try {
    await cerrarSesion()
  } finally {
    sesion.value = null
    router.push({ name: 'login' })
  }
}

onMounted(() => {
  document.addEventListener('click', cerrarSiFuera)
  document.addEventListener('keydown', cerrarConEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', cerrarSiFuera)
  document.removeEventListener('keydown', cerrarConEscape)
})

onMounted(async () => {
  if (!esDev) return
  try {
    await getApiHealth()
    apiStatus.value = 'conectado'
  } catch {
    apiStatus.value = 'sin conexión'
  }
})
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <tp-brand />
      <nav class="links" aria-label="Principal">
        <RouterLink v-for="s in secciones.slice(0, 3)" :key="s.to" :to="s.to" class="nav-link">{{ s.texto }}</RouterLink>
      </nav>
      <div class="spacer"></div>
      <span v-if="esDev" class="api-status" :class="apiStatus.replace(' ', '-')">
        <span class="dot"></span>
        API {{ apiStatus }}
      </span>
      <div v-if="sesion" ref="menuRef" class="user-menu">
        <button
          type="button"
          class="avatar-link"
          aria-label="Menú de usuario"
          aria-haspopup="menu"
          :aria-expanded="menuAbierto"
          @click="menuAbierto = !menuAbierto"
        >
          <tp-avatar :size="32" :name="sesion.nombre" />
        </button>
        <div v-if="menuAbierto" class="menu" role="menu">
          <RouterLink to="/perfil" class="menu-item" role="menuitem">Mi perfil</RouterLink>
          <button type="button" class="menu-item" role="menuitem" @click="salir">Cerrar sesión</button>
        </div>
      </div>
      <RouterLink v-else to="/login" class="nav-link">Iniciar sesión</RouterLink>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <nav class="tabbar" aria-label="Principal">
      <RouterLink v-for="s in secciones" :key="s.to" :to="s.to" class="tab">
        <tp-icon :name="s.icono" :size="22" />
        <span>{{ s.corto }}</span>
      </RouterLink>
      <RouterLink :to="sesion ? '/perfil' : '/login'" class="tab">
        <tp-icon name="perfil" :size="22" />
        <span>{{ sesion ? 'Perfil' : 'Entrar' }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
/* Mobile-first: barra superior mínima (marca y avatar) + tab bar inferior. */
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 56px;
  padding: 8px var(--gutter);
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}

.links {
  display: none;
}

.spacer {
  flex: 1;
}

.avatar-link {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: none;
  border-radius: 50%;
  cursor: pointer;
}

.user-menu {
  position: relative;
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 20;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

.menu-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 6px;
  background: none;
  font: inherit;
  font-size: 14px;
  color: var(--ink);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.menu-item:hover,
.menu-item:focus-visible {
  background: var(--chip-bg);
}

.nav-link {
  font-size: 14px;
  color: var(--ink-soft);
  text-decoration: none;
  padding: 8px 4px;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.nav-link.router-link-active {
  color: var(--ink);
  font-weight: 600;
  border-bottom-color: var(--green-dark);
}

.api-status {
  display: none;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-soft);
  padding: 5px 10px;
  border-radius: 20px;
  background: var(--chip-bg);
}

.api-status .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--sand-dark);
}

.api-status.conectado .dot {
  background: var(--green-dark);
}

.api-status.sin-conexión .dot {
  background: var(--terracotta);
}

.content {
  flex: 1;
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;
  padding: 24px var(--gutter) calc(var(--tabbar-h) + 32px + env(safe-area-inset-bottom));
}

.tabbar {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--paper);
  border-top: 1px solid var(--line);
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 44px;
  font-size: 11px;
  color: var(--ink-soft);
  text-decoration: none;
}

.tab.router-link-active {
  color: var(--green-dark);
  font-weight: 600;
}

/* Tablet (≥640): barra superior horizontal con texto, sin tab bar. */
@media (min-width: 640px) {
  .tabbar {
    display: none;
  }

  .links {
    display: flex;
    gap: 20px;
    margin-left: 12px;
  }

  .content {
    padding-top: 32px;
    padding-bottom: 60px;
  }
}

/* Escritorio (≥1024): barra con más aire y estado de la API (solo dev). */
@media (min-width: 1024px) {
  .topbar {
    gap: 28px;
  }

  .links {
    gap: 28px;
  }

  .api-status {
    display: inline-flex;
  }

  .content {
    padding-top: 36px;
  }
}
</style>
