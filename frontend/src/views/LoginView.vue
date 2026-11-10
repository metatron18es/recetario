<script setup lang="ts">
import TpButton from '../components/atoms/tp-button.vue'
import TpInput from '../components/atoms/tp-input.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TpBrand from '../components/molecules/tp-brand.vue'
import TpCard from '../components/atoms/tp-card.vue'
import { iniciarSesion, registrarUsuario } from '../lib/api'

const isRegister = ref(false)
const router = useRouter()
const nombre = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const aviso = ref('')
const enviando = ref(false)

async function registrar() {
  error.value = ''
  enviando.value = true
  try {
    await registrarUsuario({ nombre: nombre.value, email: email.value, password: password.value })
    aviso.value = 'Cuenta creada. Ya puedes iniciar sesión.'
    password.value = ''
    isRegister.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo crear la cuenta'
  } finally {
    enviando.value = false
  }
}

async function submit() {
  error.value = ''
  aviso.value = ''
  enviando.value = true
  try {
    await iniciarSesion({ email: email.value, password: password.value })
    router.push('/recetas')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo iniciar sesión'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <tp-card size="lg" class="login-card">
      <tp-brand size="lg" />

      <form v-if="isRegister" class="form" @submit.prevent="registrar">
        <h1>Crea tu cuenta</h1>
        <p class="lead">Guarda tus recetas, planifica tu semana y controla alergias e ingredientes.</p>
        <tp-input id="r-name" v-model="nombre" label="Nombre" type="text" placeholder="Tu nombre" autocomplete="name" required/>
        <tp-input id="r-email" v-model="email" label="Email" type="email" placeholder="tucorreo@ejemplo.com" autocomplete="email" required/>
        <tp-input id="r-pass" v-model="password" label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password" required minlength="8"/>
        <p v-if="error" class="msg msg--error" role="alert">{{ error }}</p>
        <tp-button class="submit-btn" type="submit" :disabled="enviando">Crear cuenta</tp-button>
        <p class="switch">
          ¿Ya tienes cuenta? <tp-button variant="link" @click="isRegister = false">Inicia sesión</tp-button>
        </p>
      </form>

      <form v-else class="form" @submit.prevent="submit">
        <h1>Bienvenido de nuevo</h1>
        <p class="lead">Accede para gestionar tus recetas y tu calendario semanal.</p>
        <p v-if="aviso" class="msg" role="status">{{ aviso }}</p>
        <tp-input id="l-email" v-model="email" label="Email" type="email" placeholder="tucorreo@ejemplo.com" autocomplete="email" required/>
        <tp-input id="l-pass" v-model="password" label="Contraseña" type="password" placeholder="Tu contraseña" autocomplete="current-password" required>
          <template #aside><tp-button variant="link">¿Olvidaste tu contraseña?</tp-button></template>
        </tp-input>
        <p v-if="error" class="msg msg--error" role="alert">{{ error }}</p>
        <tp-button class="submit-btn" type="submit" :disabled="enviando">Iniciar sesión</tp-button>
        <div class="divider"><span>o</span></div>
        <tp-button variant="secondary" @click="isRegister = true; error = ''">Crear cuenta nueva</tp-button>
      </form>
    </tp-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h1 {
  font-size: 26px;
  margin-bottom: 6px;
}

.lead {
  font-size: 13.5px;
  color: var(--ink-soft);
  margin: 0 0 12px;
  line-height: 1.5;
}

.submit-btn {
  margin-top: 6px;
  width: 100%;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink-soft);
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}

.msg {
  font-size: 13px;
  margin: 0;
  color: var(--ink-soft);
}

.msg--error {
  color: #b3261e;
}

.switch {
  text-align: center;
  font-size: 13px;
  color: var(--ink-soft);
  margin: 0;
}
</style>
