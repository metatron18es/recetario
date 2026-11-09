import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import TpRemovableImage from './tp-removable-image.vue'

const SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="#d9a066"/></svg>')

const meta = {
  title: 'Molecules/tp-removable-image',
  component: TpRemovableImage,
  args: { src: SRC, alt: 'Foto de ejemplo', onRemove: fn() },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
} satisfies Meta<typeof TpRemovableImage>

export default meta
type Story = StoryObj<typeof meta>

export const Medio: Story = {}
export const Pequeno: Story = { args: { size: 'sm' } }
