<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TpMealCell from '../components/molecules/tp-meal-cell.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import TpSelect from '../components/atoms/tp-select.vue'
import TpAutocomplete from '../components/molecules/tp-autocomplete.vue'
import TpChip from '../components/atoms/tp-chip.vue'
import { sesion } from '../lib/sesion'
import { DIETAS, useRecetarioStore, type TipoDieta } from '../stores/recetario'

const store = useRecetarioStore()

// En mobile/tablet se muestra un solo día; en escritorio, la semana completa.
const diaActivo = ref<(typeof store.dias)[number]>(store.dias[0])

// Filtros visibles para todos. Con sesión parten de las preferencias del perfil; los cambios
// aquí son locales y no modifican el perfil.
// Exclusiones: ids < 1000 son alergias/grupos comunes (Gluten, Pescado…); id >= 1000 es el ingrediente (id - 1000).
const OFFSET_INGREDIENTE = 1000
const dietaFiltro = ref<TipoDieta | ''>(sesion.value ? store.preferencia.tipoDieta : '')
const exclusiones = ref<number[]>(sesion.value ? [...store.alergiasUsuario] : [])
const filtrosAbiertos = ref(false)
const busqueda = ref('')
const filtrosRef = ref<HTMLElement | null>(null)
const numFiltros = computed(() => (dietaFiltro.value ? 1 : 0) + exclusiones.value.length)

const todasLasOpciones = computed(() => [
  ...store.alergiasDisponibles.map((a) => ({ id: a.id, label: a.nombre })),
  ...store.ingredientes.map((i) => ({ id: OFFSET_INGREDIENTE + i.id, label: i.nombre })),
])
const opcionesDisponibles = computed(() => todasLasOpciones.value.filter((o) => !exclusiones.value.includes(o.id)))
const chips = computed(() =>
  exclusiones.value.map((id) => ({ id, label: todasLasOpciones.value.find((o) => o.id === id)?.label ?? String(id) })),
)

function anadirExclusion(id: number) {
  if (!exclusiones.value.includes(id)) exclusiones.value.push(id)
}
function quitarExclusion(id: number) {
  exclusiones.value = exclusiones.value.filter((e) => e !== id)
}

// El panel flotante se cierra al pulsar fuera o con Escape.
function cerrarSiFuera(e: MouseEvent) {
  // composedPath() se fija al despachar el evento: aunque el elemento pulsado (p. ej. una sugerencia
  // del buscador) ya se haya quitado del DOM, sigue contando como pulsación dentro del panel.
  if (filtrosRef.value && !e.composedPath().includes(filtrosRef.value)) filtrosAbiertos.value = false
}
function cerrarConEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') filtrosAbiertos.value = false
}
onMounted(() => {
  document.addEventListener('click', cerrarSiFuera)
  document.addEventListener('keydown', cerrarConEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', cerrarSiFuera)
  document.removeEventListener('keydown', cerrarConEscape)
})

// Una receta encaja si su dieta no es más restrictiva que la elegida y no contiene alérgenos ni ingredientes excluidos.
function cumpleFiltros(receta: ReturnType<typeof store.recetaPorId> & object) {
  if (dietaFiltro.value && DIETAS.indexOf(store.dietaDeReceta(receta)) > DIETAS.indexOf(dietaFiltro.value)) return false
  if (store.alergenosDeReceta(receta).some((a) => exclusiones.value.includes(a))) return false
  return !receta.ingredientes.some((ri) => exclusiones.value.includes(OFFSET_INGREDIENTE + ri.ingredienteId))
}

function celda(dia: (typeof store.dias)[number], momento: (typeof store.momentos)[number]) {
  const entrada = store.calendario.find((e) => e.diaSemana === dia && e.tipoComida === momento)
  const receta = entrada?.recetaId ? store.recetaPorId(entrada.recetaId) : undefined
  // Las recetas que no cumplen los filtros se ven como hueco, pero no se borran: al quitar el filtro vuelven.
  return receta && cumpleFiltros(receta) ? receta : undefined
}

function generarAutomaticamente() {
  // Fase de esqueleto: el motor de reglas real llegará con el backend (aquí ya filtra por dieta y alergias; falta el objetivo calórico).
  for (const dia of store.dias) {
    for (const momento of store.momentos) {
      const candidatas = store.recetas.filter((r) => r.tipoComida === momento && cumpleFiltros(r))
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
        <div class="corner">
          <div ref="filtrosRef" class="filters">
            <button
              type="button"
              class="filters__toggle"
              :aria-expanded="filtrosAbiertos"
              aria-controls="panel-filtros"
              @click="filtrosAbiertos = !filtrosAbiertos"
            >
              Filtros
              <span v-if="numFiltros" class="filters__count">{{ numFiltros }}</span>
              <span class="filters__caret" :class="{ 'filters__caret--open': filtrosAbiertos }" aria-hidden="true">▾</span>
            </button>
            <div v-if="filtrosAbiertos" id="panel-filtros" class="filters__panel">
              <tp-select id="filtro-dieta" label="Tipo de dieta" v-model="dietaFiltro">
                <option value="">Cualquiera</option>
                <option v-for="d in DIETAS" :key="d" :value="d">{{ d }}</option>
              </tp-select>
              <div class="filters__group">
                <span class="filters__label">Excluir alergias e ingredientes</span>
                <tp-autocomplete
                  v-model="busqueda"
                  :options="opcionesDisponibles"
                  placeholder="Busca gluten, pescado, aguacate…"
                  aria-label="Buscar alergia o ingrediente a excluir"
                  @select="anadirExclusion"
                />
                <ul v-if="chips.length" class="filters__chips">
                  <li v-for="c in chips" :key="c.id">
                    <tp-chip class="filters__chip">
                      {{ c.label }}
                      <button type="button" class="filters__remove" :aria-label="`Quitar ${c.label}`" @click="quitarExclusion(c.id)">×</button>
                    </tp-chip>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
.filters {
  position: relative;
}

.filters__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.filters__count {
  min-width: 20px;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--green-dark);
  color: #fff;
  font-size: 12px;
  text-align: center;
}

.filters__caret {
  transition: transform 0.15s;
}

.filters__caret--open {
  transform: rotate(180deg);
}

.filters__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  width: min(340px, calc(100vw - 2 * var(--gutter)));
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.16);
}

.filters__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.filters__remove {
  margin-left: 6px;
  padding: 0 2px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}

.filters__label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft);
}

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

.day-header,
.cell--off {
  display: none;
}

/* Mobile: la celda de la esquina ocupa su propia fila y aloja el botón de filtros. */
.corner {
  display: block;
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
