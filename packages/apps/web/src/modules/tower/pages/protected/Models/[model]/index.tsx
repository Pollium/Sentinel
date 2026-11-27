import ModelPanel from '@/modules/tower/components/ModelPanel';
import BackLink from '@sentinel/ui/components/BackLink';
import QueryState from '@sentinel/ui/components/QueryState';
import Skeleton from '@sentinel/ui/components/Skeleton';
import { TowerOutlet } from '@/modules/tower/contracts/tower-outlet';
import { usageRoutes } from '@sentinel/contracts/usage/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { usePeriod } from '@/modules/tower/hooks/use-period';
import { routesOf } from '@/modules/tower/utils/prices';
import { useOutletContext, useParams } from 'react-router-dom';

const Model = () => {
    const params = useParams();
    const [window] = usePeriod();
    const { providers, overview } = useOutletContext<TowerOutlet>();
    const usage = useQuery(usageRoutes.modelUsage, { path: { model: params.model }, query: { window } });
    const model = params.model ?? '';
    const routes = routesOf(providers.data ?? [], model);
    const kind = overview.data?.models.find((share) => share.id === model)?.kind ?? routes.at(0)?.provider.kind ?? 'chat';

    return (
        <div className='flex flex-col gap-4'>
            <BackLink to='/models' label='Models' className='lg:hidden' />

            <QueryState query={usage} errorTitle='This model could not be measured' errorDescription={null} skeleton={<Skeleton className='h-[28rem] w-full rounded-2xl' />}>
                {(slice) => <ModelPanel model={model} kind={kind} slice={slice} routes={routes} />}
            </QueryState>
        </div>
    );
};

export default Model;
