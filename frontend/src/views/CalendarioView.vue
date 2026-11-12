<script setup lang="ts">
import { ref } from 'vue'
import TpMealCell from '../components/molecules/tp-meal-cell.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import { useRecetarioStore } from '../stores/recetario'

const store = useRecetarioStore()

// En mobile/tablet se muestra un solo día; en escritorio, la semana completa.
const diaActivo = ref<(typeof store.dias)[number]>(store.dias[0])

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
        <tp-button class="generate" @click="generarAutomaticamente">Generar automáticamente</tp-button>
      </div>
    </tp-page-header>

    <div class="day-tabs" role="tablist" aria-label="Día de la semana">
      <button
        v-for="dia in store.dias"
        :key="dia"
        type="button"
        role="tab"
        class="day-tab"
        :class="{ 'day-tab--active': dia === diaActivo }"
        :aria-selected="dia === diaActivo"
        @click="diaActivo = dia"
      >
        {{ dia.slice(0, 3) }}
      </button>
    </div>

    <div class="scroll-wrapper">
      <div class="grid">
        <div class="corner"></div>
        <div v-for="dia in store.dias" :key="dia" class="day-header">{{ dia }}</div>

        <template v-for="momento in store.momentos" :key="momento">
          <div class="moment-label">{{ momento }}</div>
          <tp-meal-cell
            v-for="dia in store.dias"
            :key="dia + momento"
            class="cell"
            :class="{ 'cell--off': dia !== diaActivo }"
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.actions .generate {
  grid-column: 1 / -1;
  order: -1;
}

@media (min-width: 640px) {
  .actions {
    display: flex;
    flex-wrap: wrap;
  }

  .actions .generate {
    order: 0;
  }
}

/* Mobile-first: un día cada vez, momentos apilados. */
.day-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.day-tab {
  flex: 1;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-transform: capitalize;
  cursor: pointer;
}

.day-tab--active {
  background: var(--green-dark);
  border-color: var(--green-dark);
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.corner,
.day-header,
.cell--off {
  display: none;
}

.moment-label {
  background: var(--sand);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  font-size: 12.5px;
  font-weight: 700;
}

@media (min-width: 1024px) {
  .day-tabs {
    display: none;
  }

  .scroll-wrapper {
    overflow-x: auto;
  }

  .grid {
    grid-template-columns: 110px repeat(7, minmax(130px, 1fr));
    min-width: 900px;
  }

  .corner,
  .day-header,
  .cell--off {
    display: block;
  }

  .cell--off {
    display: flex;
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
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-top: 0;
  }
}
</style>
