import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpChip from './tp-chip.vue'

const meta = {
  title: 'Atoms/tp-chip',
  component: TpChip,
  args: { default: 'Vegana', type: 'neutral', selectable: false, selected: false },
  argTypes: { type: { control: 'inline-radio', options: ['neutral', 'strong'] } },
} satisfies Meta

export default meta
export const Default: StoryObj = {}
export const Seleccionable: StoryObj = { args: { selectable: true, selected: false } }
export const Seleccionada: StoryObj = { args: { selectable: true, selected: true } }
export const Destacado: StoryObj = { args: { type: 'strong', default: 'Comida' } }
