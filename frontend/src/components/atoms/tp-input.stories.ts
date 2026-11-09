import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import TpInput from './tp-input.vue'

const meta = {
  title: 'Atoms/tp-input',
  component: TpInput,
  args: { label: 'Nombre de la receta', modelValue: '', placeholder: 'Ej. Tortilla de patatas', type: 'text', disabled: false },
  argTypes: { type: { control: 'select', options: ['text', 'number', 'email', 'password'] }, disabled: { control: 'boolean' } },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpInput },
      setup: () => ({ args, updateArgs }),
      template: '<tp-input v-bind="args" @update:model-value="updateArgs({ modelValue: $event })" />',
    }
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {}
export const SinEtiqueta: Story = { args: { label: undefined } }
export const Numerico: Story = { args: { label: 'Objetivo calórico', type: 'number', modelValue: 2000, placeholder: '' } }
export const Deshabilitado: Story = { args: { disabled: true } }
