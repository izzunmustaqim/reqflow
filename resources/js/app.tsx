import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Sample Management';

const pages = import.meta.glob('./Pages/**/*.tsx');

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, pages),
    setup({ el, App, props }) {
        const root = createRoot(el!);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4f46e5',
    },
});
