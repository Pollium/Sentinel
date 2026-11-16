export interface ErrorNotice{
    title: string;
    retry?: () => void;
}
