import Skeleton from '../Skeleton';
import { skeletonKeys } from '../../utils/format/skeleton-keys';

interface SkeletonListProps{
    count: number;
}

const SkeletonList = ({ count }: SkeletonListProps) => (
    <div className='flex flex-col gap-1.5 px-3.5 pt-3'>
        {skeletonKeys(count).map((key) => <Skeleton key={key} className='h-7 w-full rounded-md' />)}
    </div>
);

export default SkeletonList;
