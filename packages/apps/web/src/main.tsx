import '@/assets/styles/index.css';
import { configure } from '@pollium/readable-react/app/config';
import { mountApp } from '@sentinel/ui/app/mount';
import { appCopy } from '@sentinel/ui/utils/format/app-copy';
import { router } from '@/app/router';

configure({ name: 'sentinel', apiUrl: import.meta.env.VITE_API_URL, copy: appCopy });
mountApp(router);
