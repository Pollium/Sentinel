import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BackLinkProps{
    to: string;
    label: string;
    className: string;
}

const BackLink = ({ to, label, className }: BackLinkProps) => (
    <Link to={to} className={`${className} inline-flex w-fit items-center gap-1.5 text-[0.8125rem] text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none`}>
        <ArrowLeft className='size-4' aria-hidden='true' />
        {label}
    </Link>
);

export default BackLink;
