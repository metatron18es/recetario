import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import TpStepsEditor from './tp-steps-editor.vue'

const meta = {
  title: 'Organisms/tp-steps-editor',
  component: TpStepsEditor,
  args: { modelValue: [{ texto: '' }] },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpStepsEditor },
      setup: () => ({ args, updateArgs }),
      template: '<tp-steps-editor v-bind="args" @update:model-value="updateArgs({ modelValue: $event })" />',
    }
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Vacio: Story = {}
export const ConPasos: Story = {
  args: {
    modelValue: [
      { texto: 'Pela y corta las patatas en láminas finas.' },
      { texto: 'Fríelas a fuego medio hasta que estén blandas.' },
      { texto: 'Bate los huevos, mézclalos con las patatas y cuaja la tortilla.' },
    ],
  },
}
