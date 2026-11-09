import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, userEvent, within } from 'storybook/test'
import TpAutocomplete from './tp-autocomplete.vue'

const options = ['Arroz', 'Aguacate', 'Aceite de oliva', 'Garbanzos', 'Lentejas', 'Quinoa', 'Tomate', 'Zanahoria'].map((label, i) => ({ id: i + 1, label }))

const meta = {
  title: 'Molecules/tp-autocomplete',
  component: TpAutocomplete,
  args: { options, placeholder: 'Buscar ingrediente…', ariaLabel: 'Ingrediente', limit: 6, modelValue: '', onSelect: fn(), onCreate: fn() },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpAutocomplete },
      setup: () => ({ args, updateArgs }),
      template: '<div style="max-width: 360px; min-height: 280px"><tp-autocomplete v-bind="args" @update:model-value="updateArgs({ modelValue: $event })" /></div>',
    }
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {
  // Escribe en el campo para comprobar que filtra las sugerencias y que el v-model se actualiza.
  play: async ({ canvasElement }) => {
    const campo = within(canvasElement).getByRole('textbox')
    await userEvent.type(campo, 'ar')
    await expect(campo).toHaveValue('ar')
    await expect(within(canvasElement).getByText('Arroz')).toBeVisible()
  },
}
export const PermiteCrear: Story = { args: { createLabel: 'Proponer "{query}" como nuevo', modelValue: 'Cúrcuma' } }
