import { MODEL_GRID } from '../../utils/format/provider-models';

const ProviderModelHeader = () => (
    <div aria-hidden='true' className={MODEL_GRID}>
        <span className='truncate text-[0.6875rem] font-normal text-muted'>Model id</span>
        <span className='truncate text-[0.6875rem] font-normal text-muted'>Upstream id</span>
        <span className='truncate text-[0.6875rem] font-normal text-muted'>Input</span>
        <span className='truncate text-[0.6875rem] font-normal text-muted'>Cached</span>
        <span className='truncate text-[0.6875rem] font-normal text-muted'>Output</span>
        <span className='truncate text-[0.6875rem] font-normal text-muted'>Reasoning</span>
        <span className='truncate text-[0.6875rem] font-normal text-muted'>Context</span>
        <span />
    </div>
);

export default ProviderModelHeader;
