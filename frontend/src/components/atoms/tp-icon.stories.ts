import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { COLORES } from '../../design/colors'
import { NOMBRES_ICONO } from './tp-icon'
import TpIcon from './tp-icon.vue'

const meta = {
  title: 'Atoms/tp-icon',
  component: TpIcon,
  args: { name: 'check', size: 32, color: 'green-dark' },
  argTypes: {
    name: { control: 'select', options: NOMBRES_ICONO },
    size: { control: { type: 'range', min: 12, max: 96, step: 2 } },
    color: { control: 'select', options: [undefined, ...COLORES] },
  },
} satisfies Meta<typeof TpIcon>

export default meta
export const Default: StoryObj<typeof meta> = {}
