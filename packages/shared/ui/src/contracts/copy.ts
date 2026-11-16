export interface Copyable{
    copied: boolean;
    copy: () => Promise<void>;
}
