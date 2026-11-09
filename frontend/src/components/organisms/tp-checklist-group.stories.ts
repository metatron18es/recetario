import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TpChecklistItem from '../molecules/tp-checklist-item.vue'
import TpChecklistGroup from './tp-checklist-group.vue'

const meta = {
  title: 'Organisms/tp-checklist-group',
  component: TpChecklistGroup,
  args: { title: 'Frutas y verduras', hint: '2 pendientes' },
  render: (args) => ({
    components: { TpChecklistGroup, TpChecklistItem },
    setup: () => ({ args }),
    template: `<tp-checklist-group v-bind="args">
  <tp-checklist-item label="Aguacate" detail="2 ud" />
  <tp-checklist-item label="Tomate cherry" detail="250 g" model-value />
  <tp-checklist-item label="Lima" detail="1 ud" />
</tp-checklist-group>`,
  }),
} satisfies Meta

export default meta
export const Default: StoryObj = {}
