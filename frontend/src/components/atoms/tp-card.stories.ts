import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpCard from './tp-card.vue'

const meta = {
  title: 'Atoms/tp-card',
  component: TpCard,
  args: { default: 'Contenido de la tarjeta', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'lg'] } },
} satisfies Meta

export default meta
export const Default: StoryObj = {}
export const Grande: StoryObj = { args: { size: 'lg' } }
