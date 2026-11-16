export const providerPath = (id: string): string => `/providers/${id}`;

export const modelPath = (model: string): string => `/models/${encodeURIComponent(model)}`;

export const keyPath = (id: string): string => `/keys/${id}`;
