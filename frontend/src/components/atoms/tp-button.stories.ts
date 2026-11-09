import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { NOMBRES_ICONO } from './tp-icon'
import TpButton from './tp-button.vue'

const meta = {
  title: 'Atoms/tp-button',
  component: TpButton,
  args: { variant: 'primary', default: 'Guardar receta' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'link', 'icon'] },
    type: { control: 'inline-radio', options: ['button', 'submit'] },
    to: { control: 'text' },
    icon: { control: 'select', options: [undefined, ...NOMBRES_ICONO] },
    iconPosition: { control: 'inline-radio', options: ['start', 'end'] },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Link: Story = { args: { variant: 'link' } }
export const ComoEnlace: Story = { args: { to: '/recetas' } }
export const IconoAntes: Story = { args: { variant: 'link', icon: 'back', default: 'Volver a mis recetas', to: '/recetas' } }
export const IconoDespues: Story = { args: { variant: 'secondary', icon: 'check', iconPosition: 'end', default: 'Marcar como hecha' } }
