import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import { emptyIngredientRow } from './ingredient-row'
import TpIngredientsEditor from './tp-ingredients-editor.vue'

const meta = {
  title: 'Organisms/tp-ingredients-editor',
  component: TpIngredientsEditor,
  args: { modelValue: [emptyIngredientRow()] },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpIngredientsEditor },
      setup: () => ({ args, updateArgs }),
      template: '<tp-ingredients-editor v-bind="args" @update:model-value="updateArgs({ modelValue: $event })" />',
    }
  },
} satisfies Meta

export default meta
type Story = StoryObj

// Usa el store de Pinia con los datos de ejemplo (catálogo de ingredientes).
export const FilaVacia: Story = {}
export const ConIngredientes: Story = {
  args: {
    modelValue: [
      { ...emptyIngredientRow(), ingredienteId: 1, cantidad: 200, unidad: 'g' },
      { ...emptyIngredientRow(), nombrePendiente: 'Azafrán', cantidad: 1, unidad: 'g' },
      emptyIngredientRow(),
    ],
  },
}
