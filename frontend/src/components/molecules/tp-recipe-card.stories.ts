import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useRecetarioStore } from '../../stores/recetario'
import TpRecipeCard from './tp-recipe-card.vue'

const meta = {
  title: 'Molecules/tp-recipe-card',
  component: TpRecipeCard,
  // La receta sale del store de ejemplo; el índice se elige con el control "indice".
  args: { indice: 0 },
  render: (args) => ({
    components: { TpRecipeCard },
    setup() {
      const store = useRecetarioStore()
      return { receta: store.recetas[(args as { indice: number }).indice] ?? store.recetas[0] }
    },
    template: '<div style="max-width: 320px"><tp-recipe-card :recipe="receta" /></div>',
  }),
} satisfies Meta

export default meta
type Story = StoryObj

export const Primera: Story = {}
export const Segunda: Story = { args: { indice: 1 } }
export const Tercera: Story = { args: { indice: 2 } }
