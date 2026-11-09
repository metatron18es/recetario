import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { useArgs } from 'storybook/preview-api'
import TpImageUploader from './tp-image-uploader.vue'

const meta = {
  title: 'Molecules/tp-image-uploader',
  component: TpImageUploader,
  args: { modelValue: [] },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return {
      components: { TpImageUploader },
      setup: () => ({ args, updateArgs }),
      template: '<tp-image-uploader v-bind="args" @update:model-value="updateArgs({ modelValue: $event })" />',
    }
  },
} satisfies Meta

export default meta
type Story = StoryObj

const foto = (color: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="${color}"/></svg>`)

export const Vacio: Story = {}
export const ConFotos: Story = { args: { modelValue: [foto('#d9a066'), foto('#8aa56b'), foto('#c1622d')] } }
