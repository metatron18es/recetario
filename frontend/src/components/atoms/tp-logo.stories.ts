import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpLogo from './tp-logo.vue'

const meta = {
  title: 'Atoms/tp-logo',
  component: TpLogo,
  args: { size: 64 },
  argTypes: { size: { control: { type: 'range', min: 16, max: 160, step: 2 } } },
} satisfies Meta<typeof TpLogo>

export default meta
export const Default: StoryObj<typeof meta> = {}
export const Pequeno: StoryObj<typeof meta> = { args: { size: 30 } }
