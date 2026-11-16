import { ModelRoute } from '@/modules/tower/utils/model-routes';

export interface ProviderFormValues{
    /** @minLength 1 */
    name: string;
    /** @minLength 1 */
    baseUrl: string;
    apiKey: string;
    isActive: boolean;
    routes: ModelRoute[];
}

export interface NewProviderFormValues extends ProviderFormValues{
    /** @minLength 1 */
    apiKey: string;
}
