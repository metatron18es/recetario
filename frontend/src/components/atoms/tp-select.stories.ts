import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import TpSelect from './tp-select.vue'

const meta = {
  title: 'Atoms/tp-select',
  component: TpSelect,
  args: { label: 'Tipo de comida', modelValue: 'Comida', disabled: false },
  argTypes: { disabled: { control: 'boolean' } },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpSelect },
      setup: () => ({ args, updateArgs }),
      template: `<tp-select v-bind="args" @update:model-value="updateArgs({ modelValue: $event })">
    <option>Desayuno</option>
    <option>Almuerzo</option>
    <option>Comida</option>
    <option>Merienda</option>
    <option>Cena</option>
  </tp-select>`,
    }
  },
} satisfies Meta

export default meta
export const Default: StoryObj = {}
