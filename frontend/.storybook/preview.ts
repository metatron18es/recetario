import { setup, type Preview } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import '../src/assets/main.css'

// Router en memoria con ruta comodín: los RouterLink se resuelven sin navegar fuera del iframe.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
})

setup((app) => {
  app.use(createPinia())
  app.use(router)
})

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { codePanel: true, source: { type: 'dynamic' } },
    options: { storySort: { order: ['Foundations', 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages'] } },
  },
}

export default preview
