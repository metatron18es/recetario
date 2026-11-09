import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpPageHeader from './tp-page-header.vue'

const meta = {
  title: 'Molecules/tp-page-header',
  component: TpPageHeader,
  args: { title: 'Mis recetas', subtitle: '12 recetas guardadas' },
} satisfies Meta

export default meta
type Story = StoryObj

export const ConSubtitulo: Story = {}
export const SinSubtitulo: Story = { args: { subtitle: undefined } }
export const ConAcciones: Story = { args: { default: 'Slot de acciones (p. ej. un botón)' } }
