<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { getApiHealth } from '../../lib/api'
import TpAvatar from '../atoms/tp-avatar.vue'
import TpIcon from '../atoms/tp-icon.vue'
import TpBrand from '../molecules/tp-brand.vue'

const secciones = [
  { to: '/recetas', texto: 'Mis recetas', corto: 'Recetas', icono: 'recetas' },
  { to: '/calendario', texto: 'Calendario', corto: 'Calendario', icono: 'calendario' },
  { to: '/lista-compra', texto: 'Lista de la compra', corto: 'Compra', icono: 'compra' },
  { to: '/perfil', texto: 'Perfil', corto: 'Perfil', icono: 'perfil' },
]

// Solo en desarrollo: comprobación simple de que el backend Express responde.
const esDev = import.meta.env.DEV
const apiStatus = ref<'comprobando' | 'conectado' | 'sin conexión'>('comprobando')

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
      <RouterLink to="/perfil" class="avatar-link" aria-label="Perfil"><tp-avatar :size="32" /></RouterLink>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <nav class="tabbar" aria-label="Principal">
      <RouterLink v-for="s in secciones" :key="s.to" :to="s.to" class="tab">
        <tp-icon :name="s.icono" :size="22" />
        <span>{{ s.corto }}</span>
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
  border-radius: 50%;
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
