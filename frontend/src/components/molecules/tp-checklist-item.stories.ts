import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import TpChecklistItem from './tp-checklist-item.vue'

const meta = {
  title: 'Molecules/tp-checklist-item',
  component: TpChecklistItem,
  args: { label: 'Aguacate', detail: '2 ud', modelValue: false },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpChecklistItem },
      setup: () => ({ args, updateArgs }),
      template: '<tp-checklist-item v-bind="args" @update:model-value="updateArgs({ modelValue: $event })" />',
    }
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {}
export const Marcado: Story = { args: { modelValue: true } }
export const SinDetalle: Story = { args: { detail: undefined } }
