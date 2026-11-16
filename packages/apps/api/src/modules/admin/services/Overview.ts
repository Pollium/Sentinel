import LiveMinutesService from './LiveMinutes';
import UsageSliceService from './UsageSlice';
import { GatewayOverview, UsageWindow } from '@sentinel/contracts/usage/domain';

export default class OverviewService{
    #slices = new UsageSliceService();
    #live = new LiveMinutesService();

    async read(window: UsageWindow): Promise<GatewayOverview>{
        const [slice, live] = await Promise.all([this.#slices.read(window, null), this.#live.read()]);
        return { ...slice, live };
    }
}
