import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'
import TpIcon from '../components/atoms/tp-icon.vue'
import TpLogo from '../components/atoms/tp-logo.vue'
import { NOMBRES_ICONO } from '../components/atoms/tp-icon'

const Galeria = defineComponent({
  components: { TpIcon, TpLogo },
  props: { size: { type: Number, default: 32 } },
  setup: () => ({ nombres: NOMBRES_ICONO }),
  template: `
    <h2 style="margin-bottom:4px">Iconos</h2>
    <p style="color:var(--ink-soft);margin-top:0">Se cargan de los ficheros SVG de <code>assets/icons</code> (trazo, rejilla 24×24); para añadir uno basta con dejar un .svg nuevo. Uso: <code>&lt;tp-icon name="check" /&gt;</code>.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px">
      <div v-for="n in nombres" :key="n" style="border:1px solid var(--line);border-radius:10px;background:var(--paper);padding:16px;text-align:center">
        <tp-icon :name="n" :size="size" color="green-dark" />
        <div style="margin-top:8px;font-size:13px"><code>{{ n }}</code></div>
      </div>
    </div>
    <h2 style="margin:28px 0 4px">Logo</h2>
    <div style="display:flex;gap:18px;align-items:center">
      <tp-logo :size="96" /><tp-logo :size="48" /><tp-logo :size="30" />
    </div>`,
})

const meta = {
  title: 'Foundations/Icons',
  component: Galeria,
  argTypes: { size: { control: { type: 'range', min: 12, max: 64, step: 2 } } },
} satisfies Meta<typeof Galeria>

export default meta
export const Galeria_: StoryObj<typeof meta> = { name: 'Galería' }
