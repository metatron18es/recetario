<script setup lang="ts">
import TpMealCell from '../components/molecules/tp-meal-cell.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import { useRecetarioStore } from '../stores/recetario'

const store = useRecetarioStore()

function celda(dia: (typeof store.dias)[number], momento: (typeof store.momentos)[number]) {
  const entrada = store.calendario.find((e) => e.diaSemana === dia && e.tipoComida === momento)
  const receta = entrada?.recetaId ? store.recetaPorId(entrada.recetaId) : undefined
  return receta
}

function generarAutomaticamente() {
  // Fase de esqueleto: el motor de reglas real llegará con el backend (filtra por dieta/alergias y objetivo calórico).
  for (const dia of store.dias) {
    for (const momento of store.momentos) {
      const candidatas = store.recetas.filter((r) => r.tipoComida === momento)
      if (candidatas.length === 0) continue
      const elegida = candidatas[Math.floor(Math.random() * candidatas.length)]
      store.asignarReceta(dia, momento, elegida.id)
    }
  }
}
</script>

<template>
  <div class="page">
    <tp-page-header title="Calendario semanal" subtitle="Semana del 26 de octubre al 1 de noviembre">
      <div class="actions">
        <tp-button variant="ghost">← Semana anterior</tp-button>
        <tp-button variant="ghost">Semana siguiente →</tp-button>
        <tp-button @click="generarAutomaticamente">Generar automáticamente</tp-button>
      </div>
    </tp-page-header>

    <div class="scroll-wrapper">
      <div class="grid">
        <div></div>
        <div v-for="dia in store.dias" :key="dia" class="day-header">{{ dia }}</div>

        <template v-for="momento in store.momentos" :key="momento">
          <div class="moment-label">{{ momento }}</div>
          <tp-meal-cell
            v-for="dia in store.dias"
            :key="dia + momento"
            :to="celda(dia, momento) ? `/recetas/${celda(dia, momento)!.id}` : '/recetas'"
            :name="celda(dia, momento)?.nombre"
            :image="celda(dia, momento)?.imagenes[0]"
            :kcal="celda(dia, momento)?.kcal"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.scroll-wrapper {
  overflow-x: auto;
}

.grid {
  display: grid;
  grid-template-columns: 110px repeat(7, minmax(130px, 1fr));
  gap: 8px;
  min-width: 900px;
}

.day-header {
  background: var(--mist);
  border-radius: 8px;
  padding: 10px 0;
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--green-dark);
}

.moment-label {
  background: var(--sand);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 700;
}
</style>
