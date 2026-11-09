import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent, onMounted, ref } from 'vue'

interface Token {
  nombre: string
  valor: string
}

// Lee todas las custom properties declaradas en :root de las hojas de estilo cargadas (assets/main.css),
// así la página lista siempre los tokens reales sin mantener una copia a mano.
function leerTokens(): Token[] {
  const nombres = new Set<string>()
  for (const hoja of Array.from(document.styleSheets)) {
    let reglas: CSSRuleList
    try {
      reglas = hoja.cssRules
    } catch {
      continue // hojas de otro origen (fuentes) no son legibles
    }
    for (const regla of Array.from(reglas)) {
      if (regla instanceof CSSStyleRule && regla.selectorText === ':root') {
        for (const prop of Array.from(regla.style)) if (prop.startsWith('--')) nombres.add(prop)
      }
    }
  }
  const estilo = getComputedStyle(document.documentElement)
  return [...nombres].map((nombre) => ({ nombre, valor: estilo.getPropertyValue(nombre).trim() }))
}

const Paleta = defineComponent({
  setup() {
    const tokens = ref<Token[]>([])
    onMounted(() => (tokens.value = leerTokens()))
    return { tokens }
  },
  template: `
    <h2 style="margin-bottom:4px">Colores</h2>
    <p style="color:var(--ink-soft);margin-top:0">
      Custom properties de <code>main.css</code>. Ningún color debe escribirse a mano en componentes: usa <code>var(--nombre)</code>.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px">
      <div v-for="t in tokens" :key="t.nombre" style="border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--paper)">
        <div :style="{ background: 'var(' + t.nombre + ')', height: '72px', borderBottom: '1px solid var(--line)' }"></div>
        <div style="padding:8px 10px;font-size:13px"><strong>{{ t.nombre }}</strong><br /><code>{{ t.valor }}</code></div>
      </div>
    </div>`,
})

const meta = { title: 'Foundations/Colors', component: Paleta, parameters: { layout: 'padded' } } satisfies Meta<typeof Paleta>

export default meta
export const Paleta_: StoryObj<typeof meta> = { name: 'Paleta' }
