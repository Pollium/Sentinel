import Skeleton from '../Skeleton';
import { skeletonKeys } from '../../utils/format/skeleton-keys';

interface SkeletonListProps{
    count: number;
    className?: string;
    itemClassName?: string;
}

const SkeletonList = ({ count, className, itemClassName }: SkeletonListProps) => (
    <div className={className}>
        {skeletonKeys(count).map((key) => <Skeleton key={key} className={itemClassName} />)}
    </div>
);

export default SkeletonList;
