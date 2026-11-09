<script setup lang="ts">
import TpAvatar from '../components/atoms/tp-avatar.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import TpSectionHeader from '../components/molecules/tp-section-header.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpCard from '../components/atoms/tp-card.vue'
import TpInput from '../components/atoms/tp-input.vue'
import TpSelect from '../components/atoms/tp-select.vue'
import TpChipGroup from '../components/molecules/tp-chip-group.vue'
import TpNotification from '../components/molecules/tp-notification.vue'
import { computed } from 'vue'
import { useRecetarioStore } from '../stores/recetario'

const store = useRecetarioStore()
const opcionesAlergia = computed(() => store.alergiasDisponibles.map((a) => ({ id: a.id, label: a.nombre })))

const seleccionadas = computed(() => store.alergiasUsuario.length)
</script>

<template>
  <div class="page">
    <tp-page-header title="Perfil y preferencias" />

    <tp-card>
      <div class="profile-row">
        <tp-avatar :size="64" />
        <div>
          <div class="name">{{ store.usuario.nombre }}</div>
          <div class="email">{{ store.usuario.email }}</div>
        </div>
        <div class="spacer"></div>
        <tp-button variant="secondary">Cambiar foto</tp-button>
      </div>
      <div class="two-col">
        <tp-input id="nombre" label="Nombre" type="text" :model-value="store.usuario.nombre" />
        <tp-input id="email" label="Email" type="email" :model-value="store.usuario.email" />
      </div>
    </tp-card>

    <tp-card>
      <tp-section-header title="Objetivo nutricional" hint="Usamos esto para ajustar las raciones y el calendario semanal." />
      <div class="two-col">
        <tp-select id="dieta" label="Tipo de dieta" v-model="store.preferencia.tipoDieta">
            <option>Omnívora</option>
            <option>Vegetariana</option>
            <option>Vegana</option>
            <option>Pescetariana</option>
          </tp-select>
        <tp-input id="kcal" label="Objetivo calórico diario" v-model="store.preferencia.objetivoCaloricoDiario" type="number" />
      </div>
    </tp-card>

    <tp-card>
      <tp-section-header title="Alergias e intolerancias" hint="Las recetas y el calendario excluirán automáticamente estos ingredientes." />
      <tp-chip-group :options="opcionesAlergia" :selected="store.alergiasUsuario" @toggle="store.toggleAlergia" />
      <tp-notification type="warning">
        Tienes {{ seleccionadas }} limitaciones activas. Se usan para filtrar recetas y generar el calendario automático.
      </tp-notification>
    </tp-card>

    <div class="form-actions">
      <tp-button variant="secondary">Cancelar</tp-button>
      <tp-button>Guardar cambios</tp-button>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 760px;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.name {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 18px;
}

.email {
  font-size: 13px;
  color: var(--ink-soft);
}

.spacer {
  flex: 1;
}

.two-col {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.two-col > div {
  flex: 1 1 200px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
