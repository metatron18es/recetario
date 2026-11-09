import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpEmptyState from './tp-empty-state.vue'

const meta = {
  title: 'Molecules/tp-empty-state',
  component: TpEmptyState,
  args: { default: 'No hay recetas que coincidan con la búsqueda.' },
} satisfies Meta

export default meta
export const Default: StoryObj = {}
