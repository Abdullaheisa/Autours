import './bootstrap';
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Dashboard from "@/Layouts/Dashboard.vue";
import PrimeVue from 'primevue/config';

createInertiaApp({
  resolve: (name) => {
    const page = resolvePageComponent(
        `./Pages/${name}.vue`,
        import.meta.glob("./Pages/**/*.vue")
    );
    page.then((module) => {
        if(!module.default.layout)
            module.default.layout = name.startsWith('Dashboard/') ? Dashboard : ''
    });
    return page;
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin).use(PrimeVue)
      .mount(el)
  },
})
