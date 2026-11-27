import { AvatarFallback, AvatarRoot } from '@heroui/react';

interface AvatarProps{
    name: string;
}

const Avatar = ({ name }: AvatarProps) => (
    <AvatarRoot size='sm' className='shrink-0'>
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </AvatarRoot>
);

export default Avatar;
