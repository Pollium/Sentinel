import { ReactNode } from 'react';

interface AuthHeadingProps{
    title: string;
    children: ReactNode;
}

const AuthHeading = ({ title, children }: AuthHeadingProps) => (
    <header className='mb-8 text-center'>
        <h1 className='text-xl font-semibold tracking-tight text-foreground'>{title}</h1>
        <p className='mt-1.5 text-sm text-muted'>{children}</p>
    </header>
);

export default AuthHeading;
