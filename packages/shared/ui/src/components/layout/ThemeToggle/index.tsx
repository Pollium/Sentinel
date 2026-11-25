import { useThemeStore } from '../../../store/theme';
import { Button } from '@heroui/react';

const ThemeToggle = () => {
    const theme = useThemeStore((state) => state.theme);
    const toggle = useThemeStore((state) => state.toggle);

    return (
        <Button
            variant='ghost'
            size='sm'
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onPress={toggle}
            className='shrink-0'
        >
            Theme
        </Button>
    );
};

export default ThemeToggle;
