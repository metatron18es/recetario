import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpStepList from './tp-step-list.vue'

const foto =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#d9c38a"/></svg>')

const meta = {
  title: 'Molecules/tp-step-list',
  component: TpStepList,
  args: {
    steps: [
      { texto: 'Pela y corta las patatas en láminas finas.' },
      { texto: 'Fríelas a fuego medio hasta que estén blandas.', imagenes: [foto, foto] },
      { texto: 'Bate los huevos, mézclalos con las patatas y cuaja la tortilla.' },
    ],
  },
} satisfies Meta<typeof TpStepList>

export default meta
export const Default: StoryObj<typeof meta> = {}
