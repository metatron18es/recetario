import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpAvatar from './tp-avatar.vue'

const FOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#55795c"/></svg>')

const meta = {
  title: 'Atoms/tp-avatar',
  component: TpAvatar,
  args: { size: 64 },
  argTypes: { size: { control: { type: 'range', min: 24, max: 120, step: 4 } } },
} satisfies Meta<typeof TpAvatar>

export default meta
export const Default: StoryObj<typeof meta> = {}
export const ConFoto: StoryObj<typeof meta> = { args: { src: FOTO, alt: 'María López' } }
export const ConIniciales: StoryObj<typeof meta> = { args: { name: 'María López' } }
