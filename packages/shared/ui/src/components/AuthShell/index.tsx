import { ReactNode } from 'react';

interface AuthShellProps{
    children: ReactNode;
}

const AuthShell = ({ children }: AuthShellProps) => (
    <main className='flex min-h-dvh items-center justify-center bg-canvas px-4 pb-30 pt-16'>
        <section className='w-full max-w-[21.25rem]'>{children}</section>
    </main>
);

export default AuthShell;
