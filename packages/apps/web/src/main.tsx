import '@/assets/styles/index.css';
import TowerLayout from '@/app/layouts/TowerLayout';
import OfflineBanner from '@sentinel/ui/components/OfflineBanner';
import Toaster from '@sentinel/ui/components/Toaster';
import { mount } from '@pollium/readable-react/app/mount';
import { appCopy } from '@sentinel/ui/utils/format/app-copy';
import { initTheme } from '@sentinel/ui/utils/session/theme';

initTheme();

mount({
    name: 'sentinel',
    apiUrl: import.meta.env.VITE_API_URL,
    pages: import.meta.glob('/src/modules/*/pages/**/{index,layout}.tsx'),
    layout: TowerLayout,
    signIn: '/sign-in',
    home: '/',
    copy: appCopy,
    wrap: (app) => (
        <>
            {app}
            <OfflineBanner />
            <Toaster />
        </>
    )
});
