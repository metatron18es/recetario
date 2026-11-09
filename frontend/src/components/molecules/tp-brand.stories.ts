import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpBrand from './tp-brand.vue'

const meta = {
  title: 'Molecules/tp-brand',
  component: TpBrand,
  args: { size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'lg'] } },
} satisfies Meta<typeof TpBrand>

export default meta
export const Default: StoryObj<typeof meta> = {}
export const Grande: StoryObj<typeof meta> = { args: { size: 'lg' } }
