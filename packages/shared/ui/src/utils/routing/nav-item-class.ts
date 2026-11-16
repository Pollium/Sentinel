export const navItemClass = (active: boolean): string =>
    `relative isolate flex h-10 w-full items-center gap-2.5 rounded-md px-2 text-[0.875rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none lg:h-8 ${
        active ? 'font-medium text-foreground' : 'text-muted hover:text-foreground'
    }`;
