const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const parseRouteId = (value: string | undefined): string | undefined => {
    if(value === undefined) return undefined;

    const id = value.toLowerCase();
    return UUID.test(id) ? id : undefined;
};
