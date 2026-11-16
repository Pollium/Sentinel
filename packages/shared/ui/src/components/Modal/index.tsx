import { ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody } from '@heroui/react';
import { ReactNode } from 'react';

interface ModalProps{
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    width?: 'default' | 'wide';
    children: ReactNode;
}

const WIDTH = {
    default: '',
    wide: 'max-w-[44rem]'
} as const;

const Modal = ({ isOpen, onOpenChange, title, width = 'default', children }: ModalProps) => (
    <ModalBackdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContainer>
            <ModalDialog className={WIDTH[width]}>
                <ModalCloseTrigger />

                <ModalHeader>
                    <ModalHeading className='break-words pe-8'>{title}</ModalHeading>
                </ModalHeader>

                <ModalBody>{children}</ModalBody>
            </ModalDialog>
        </ModalContainer>
    </ModalBackdrop>
);

export default Modal;
