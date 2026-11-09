import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpBulletList from './tp-bullet-list.vue'

const meta = {
  title: 'Atoms/tp-bullet-list',
  component: TpBulletList,
  args: { items: ['200 g de quinoa', '1 ud de aguacate', '2 cdas de aceite de oliva'] },
} satisfies Meta<typeof TpBulletList>

export default meta
export const Default: StoryObj<typeof meta> = {}
