import '@/assets/styles/index.css';
import { configure } from '@pollium/readable-react/app/config';
import { mountApp } from '@sentinel/ui/app/mount';
import { router } from '@/app/router';

configure({ name: 'sentinel', apiUrl: import.meta.env.VITE_API_URL });
mountApp(router);
