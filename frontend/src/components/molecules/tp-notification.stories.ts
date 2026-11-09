import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import TpNotification from './tp-notification.vue'

const meta = {
  title: 'Molecules/tp-notification',
  component: TpNotification,
  args: { type: 'info', default: 'Tus cambios se han guardado en este dispositivo.', dismissible: false, duration: 0, icon: true, onClose: fn() },
  argTypes: {
    type: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error'] },
    duration: { control: { type: 'number', min: 0, step: 500 } },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {}
export const Success: Story = { args: { type: 'success', default: 'Receta guardada correctamente.' } }
export const Warning: Story = {
  args: { type: 'warning', title: 'Contiene frutos secos.', default: 'Revisa tus alergias guardadas antes de añadirla al calendario.' },
}
export const Error: Story = { args: { type: 'error', title: 'No se pudo guardar', default: 'Comprueba tu conexión e inténtalo de nuevo.' } }
export const Cerrable: Story = { args: { dismissible: true } }
export const AutoCierre: Story = { args: { dismissible: true, duration: 4000, default: 'Esta notificación se cierra sola en 4 segundos. Recarga la story para verla otra vez.' } }
