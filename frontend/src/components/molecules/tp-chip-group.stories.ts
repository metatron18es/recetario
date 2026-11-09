import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import TpChipGroup from './tp-chip-group.vue'

const options = [
  { id: 1, label: 'Gluten' },
  { id: 2, label: 'Lactosa' },
  { id: 3, label: 'Frutos secos' },
  { id: 4, label: 'Huevo' },
  { id: 5, label: 'Marisco' },
]

const meta = {
  title: 'Molecules/tp-chip-group',
  component: TpChipGroup,
  args: { options, selected: [3], onToggle: fn() },
} satisfies Meta<typeof TpChipGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const NingunaActiva: Story = { args: { selected: [] } }
export const VariasActivas: Story = { args: { selected: new Set([1, 3, 5]) } }
