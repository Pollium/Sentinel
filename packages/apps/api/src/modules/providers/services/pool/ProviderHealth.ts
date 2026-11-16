import { eventBus } from '@readable/events/EventBus';
import { GatewayProviderHealth } from '@sentinel/contracts/providers/domain';

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 30_000;
const OUT_OF_CREDITS_MS = 10 * 60_000;

export default class ProviderHealth{
    #failures = new Map<string, number>();
    #cooldownUntil = new Map<string, number>();
    #outOfCredits = new Set<string>();

    recordFailure(providerId: string){
        const count = (this.#failures.get(providerId) ?? 0) + 1;
        if(count < FAILURE_THRESHOLD){
            this.#failures.set(providerId, count);
            this.#changed(providerId);
            return;
        }

        this.#failures.delete(providerId);
        this.#cooldownUntil.set(providerId, Date.now() + COOLDOWN_MS);
        this.#changed(providerId);
    }

    recordOutOfCredits(providerId: string){
        this.#failures.delete(providerId);
        this.#outOfCredits.add(providerId);
        this.#cooldownUntil.set(providerId, Date.now() + OUT_OF_CREDITS_MS);
        this.#changed(providerId);
    }

    recordSuccess(providerId: string){
        if(!this.#failures.delete(providerId)) return;

        this.#changed(providerId);
    }

    isAvailable(providerId: string): boolean{
        const until = this.#cooldownUntil.get(providerId);
        if(until === undefined) return true;

        if(Date.now() < until) return false;

        this.#cooldownUntil.delete(providerId);
        this.#outOfCredits.delete(providerId);
        this.#changed(providerId);
        return true;
    }

    stateOf(providerId: string): GatewayProviderHealth{
        const until = this.#cooldownUntil.get(providerId);

        const coolingDown = until !== undefined && Date.now() < until;

        return {
            consecutiveFailures: this.#failures.get(providerId) ?? 0,
            cooldownUntil: coolingDown ? new Date(until).toISOString() : null,
            isOutOfCredits: coolingDown && this.#outOfCredits.has(providerId)
        };
    }

    reset(){
        this.#failures.clear();
        this.#cooldownUntil.clear();
        this.#outOfCredits.clear();
    }

    #changed(providerId: string){
        eventBus.emit('providers.health.changed', {
            providerId,
            health: this.stateOf(providerId)
        });
    }
}

export const providerHealth = new ProviderHealth();
