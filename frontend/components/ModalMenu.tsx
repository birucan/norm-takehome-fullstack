'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ReactNode, useEffect } from 'react';

interface ModalMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  triggerElement?: ReactNode;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isCentered?: boolean;
  children: ReactNode;
}
//https://v2.chakra-ui.com/docs/components/modal
export default function ModalMenu({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onOpen: externalOnOpen,
  triggerElement,
  title = 'Dialog',
  size = 'md',
  isCentered = true,
  children,
}: ModalMenuProps): ReactNode {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Use external state if provided, otherwise use internal state
  const modalIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const modalOnOpen = externalOnOpen || onOpen;
  const modalOnClose = externalOnClose || onClose;

  // Sync internal state with external state if provided
  useEffect(() => {
    if (externalIsOpen !== undefined && externalIsOpen !== isOpen) {
      if (externalIsOpen) {
        onOpen();
      } else {
        onClose();
      }
    }
  }, [externalIsOpen, isOpen, onOpen, onClose]);

  return (
    <>
      {triggerElement && (
        <div onClick={modalOnOpen} style={{ display: 'inline-block' }}>
          {triggerElement}
        </div>
      )}
      <Modal
        isOpen={modalIsOpen}
        onClose={modalOnClose}
        size={size}
        isCentered={isCentered}
      >
        <ModalOverlay />
        <ModalContent
          bg="white"
          borderColor="#DBDCE1"
          borderWidth="1px"
        >
          <ModalHeader
            color="#32343C"
            fontSize="lg"
            fontWeight="bold"
            borderBottom="1px"
            borderColor="#DBDCE1"
          >
            {title}
          </ModalHeader>
          <ModalCloseButton
            color="#5E6272"
            _hover={{ color: '#2800D7', bg: '#EEEBFF' }}
          />
          <ModalBody py={4}>
            {children}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}