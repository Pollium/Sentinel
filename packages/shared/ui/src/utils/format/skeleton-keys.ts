export const skeletonKeys = (count: number): string[] =>
    Array.from({ length: count }, (_, index) => `skeleton-${index}`);
