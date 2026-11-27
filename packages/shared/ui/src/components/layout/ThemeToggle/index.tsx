import { useThemeStore } from '../../../store/theme';
import { Button } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const theme = useThemeStore((state) => state.theme);
    const toggle = useThemeStore((state) => state.toggle);
    const isDark = theme === 'dark';

    return (
        <Button
            isIconOnly
            variant='ghost'
            size='sm'
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onPress={toggle}
            className='size-10 rounded-lg text-muted lg:size-8'
        >
            {isDark ? <Sun className='size-4' /> : <Moon className='size-4' />}
        </Button>
    );
};

export default ThemeToggle;
