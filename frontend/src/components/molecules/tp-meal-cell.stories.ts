import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpMealCell from './tp-meal-cell.vue'

const imagen =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="#e8a97e"/></svg>')

const meta = {
  title: 'Molecules/tp-meal-cell',
  component: TpMealCell,
  args: { to: '/recetas/1', name: 'Bowl de quinoa y aguacate', image: imagen, kcal: 480 },
  render: (args) => ({ components: { TpMealCell }, setup: () => ({ args }), template: '<div style="width: 150px"><tp-meal-cell v-bind="args" /></div>' }),
} satisfies Meta

export default meta
export const Default: StoryObj = {}
export const Vacia: StoryObj = { args: { to: '/recetas', name: undefined, image: undefined, kcal: undefined } }
