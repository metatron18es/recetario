import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpImageGallery from './tp-image-gallery.vue'

const img = (color: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="480" height="300" fill="${color}"/></svg>`)

const meta = {
  title: 'Molecules/tp-image-gallery',
  component: TpImageGallery,
  args: { images: [img('#e8a97e'), img('#9ab08a'), img('#d9c38a')], alt: 'Foto de la receta' },
} satisfies Meta<typeof TpImageGallery>

export default meta
export const Default: StoryObj<typeof meta> = {}
export const UnaImagen: StoryObj<typeof meta> = { args: { images: [img('#e8a97e')] } }
