import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import TpTextarea from './tp-textarea.vue'

const meta = {
  title: 'Atoms/tp-textarea',
  component: TpTextarea,
  args: { label: 'Descripción', modelValue: '', placeholder: 'Cuenta algo sobre la receta', rows: 4, disabled: false },
  argTypes: { rows: { control: { type: 'number', min: 2, max: 12 } }, disabled: { control: 'boolean' } },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpTextarea },
      setup: () => ({ args, updateArgs }),
      template: '<tp-textarea v-bind="args" @update:model-value="updateArgs({ modelValue: $event })" />',
    }
  },
} satisfies Meta

export default meta
export const Default: StoryObj = {}
