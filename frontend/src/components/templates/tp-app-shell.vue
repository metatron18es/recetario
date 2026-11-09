<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { getApiHealth } from '../../lib/api'
import TpAvatar from '../atoms/tp-avatar.vue'
import TpBrand from '../molecules/tp-brand.vue'

// Esqueleto: comprobación simple de que el backend Express responde.
const apiStatus = ref<'comprobando' | 'conectado' | 'sin conexión'>('comprobando')

onMounted(async () => {
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
    <nav class="nav">
      <tp-brand />
      <RouterLink to="/recetas" class="nav-link">Mis recetas</RouterLink>
      <RouterLink to="/calendario" class="nav-link">Calendario</RouterLink>
      <RouterLink to="/lista-compra" class="nav-link">Lista de la compra</RouterLink>
      <RouterLink to="/perfil" class="nav-link">Perfil</RouterLink>
      <div class="spacer"></div>
      <span class="api-status" :class="apiStatus.replace(' ', '-')">
        <span class="dot"></span>
        API {{ apiStatus }}
      </span>
      <RouterLink to="/perfil" aria-label="Perfil"><tp-avatar :size="32" /></RouterLink>
    </nav>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 0 40px;
  height: 68px;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.nav-link {
  font-size: 14px;
  color: var(--ink-soft);
  text-decoration: none;
  padding: 8px 4px;
  border-bottom: 2px solid transparent;
}

.nav-link.router-link-active {
  color: var(--ink);
  font-weight: 600;
  border-bottom-color: var(--green-dark);
}

.spacer {
  flex: 1;
}

.api-status {
  display: inline-flex;
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
  box-sizing: border-box;
  padding: 36px 40px 60px;
}
</style>
