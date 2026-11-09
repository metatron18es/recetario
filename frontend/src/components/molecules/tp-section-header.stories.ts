import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpSectionHeader from './tp-section-header.vue'

const meta = {
  title: 'Molecules/tp-section-header',
  component: TpSectionHeader,
  args: { title: 'Ingredientes', hint: 'Al menos uno' },
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {}
export const SinPista: Story = { args: { hint: undefined } }
