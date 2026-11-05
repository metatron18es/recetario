<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getApiHealth } from '../lib/api'

const estado = ref('comprobando…')

onMounted(async () => {
  try {
    estado.value = (await getApiHealth()).status
  } catch {
    estado.value = 'sin conexión'
  }
})
</script>

<template>
  <main>
    <h1>Tupper</h1>
    <p>API: {{ estado }}</p>
  </main>
</template>
