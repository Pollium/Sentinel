import ListGroup from '@sentinel/ui/components/ListGroup';
import ListRow from '@sentinel/ui/components/ListRow';
import ProviderRow from '@/modules/tower/components/ProviderRow';
import { GatewayShare } from '@sentinel/contracts/usage/domain';
import { PublicGatewayProvider } from '@sentinel/contracts/providers/domain';
import { KIND_LABEL, KINDS } from '@/modules/tower/utils/kinds';
import { flaggedOf, worstTone } from '@/modules/tower/utils/provider-look';
import { kindFraction, kindShare } from '@/modules/tower/utils/shares';

interface ProviderListProps{
    providers: PublicGatewayProvider[];
    shares: GatewayShare[];
    selectedId: string | undefined;
    isAllSelected: boolean;
    onChanged: () => void;
}

const ProviderList = ({ providers, shares, selectedId, isAllSelected, onChanged }: ProviderListProps) => {
    const now = Date.now();

    return (
        <>
            <div className='lg:hidden'>
                <ListRow to='/providers/all' label='All providers' isSelected={isAllSelected} />
            </div>
            {KINDS.map((kind) => {
                const own = providers.filter((provider) => provider.kind === kind).sort((a, b) => a.name.localeCompare(b.name));
                if(own.length === 0) return null;

                const tone = worstTone(flaggedOf(own, now).map(({ look }) => look.tone));

                return (
                    <ListGroup key={kind} label={KIND_LABEL[kind]} total={own.length} tone={tone ?? null}>
                        {own.map((provider) => (
                            <ProviderRow
                                key={provider.id}
                                provider={provider}
                                share={kindShare(provider, providers, shares)}
                                fraction={kindFraction(provider, providers, shares)}
                                isSelected={provider.id === selectedId}
                                onChanged={onChanged}
                            />
                        ))}
                    </ListGroup>
                );
            })}
        </>
    );
};

export default ProviderList;
