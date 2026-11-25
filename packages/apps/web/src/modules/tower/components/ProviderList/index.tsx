import ListGroup from '@sentinel/ui/components/ListGroup';
import ListRow from '@sentinel/ui/components/ListRow';
import ProviderRow from '@/modules/tower/components/ProviderRow';
import { GatewayShare } from '@sentinel/contracts/usage/domain';
import { count } from '@sentinel/ui/utils/format/format-metrics';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { KIND_LABEL, KINDS } from '@/modules/tower/utils/kinds';
import { kindFraction, kindShare } from '@/modules/tower/utils/shares';

interface ProviderListProps{
    providers: PublicGatewayProvider[];
    shares: GatewayShare[];
    selectedId: string | undefined;
    isAllSelected: boolean;
}

const ProviderList = ({ providers, shares, selectedId, isAllSelected }: ProviderListProps) => (
    <>
        <ListRow to='/providers/all' label='All providers' isSelected={isAllSelected} trailing={count(providers.length)} />
            {KINDS.map((kind) => {
                const own = providers.filter((provider) => provider.kind === kind).sort((a, b) => a.name.localeCompare(b.name));
                if(own.length === 0) return null;

                return (
                    <ListGroup key={kind} label={KIND_LABEL[kind]} total={own.length}>
                        {own.map((provider) => (
                            <ProviderRow
                                key={provider.id}
                                provider={provider}
                                share={kindShare(provider, providers, shares)}
                                fraction={kindFraction(provider, providers, shares)}
                                isSelected={provider.id === selectedId}
                            />
                        ))}
                    </ListGroup>
                );
            })}
    </>
);

export default ProviderList;
