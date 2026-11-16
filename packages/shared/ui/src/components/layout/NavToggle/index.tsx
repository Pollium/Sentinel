import { Menu } from 'lucide-react';

interface NavToggleProps{
    onOpen: () => void;
}

const NavToggle = ({ onOpen }: NavToggleProps) => {
    return (
        <button
            type='button'
            aria-label='Open navigation'
            onClick={onOpen}
            className='-ml-1 flex size-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none lg:hidden'
        >
            <Menu className='size-[18px]' aria-hidden='true' />
        </button>
    );
};

export default NavToggle;
