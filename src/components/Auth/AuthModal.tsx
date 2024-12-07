import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
} from '@chakra-ui/react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess?: () => void;
    defaultTab?: 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, defaultTab = 'login' }: AuthModalProps) => {
    const handleAuthSuccess = () => {
        if (onAuthSuccess) {
            onAuthSuccess();
        } else {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center">Authentification</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <Tabs isFitted defaultIndex={defaultTab === 'signup' ? 1 : 0}>
                        <TabList mb={4}>
                            <Tab>Connexion</Tab>
                            <Tab>Inscription</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <LoginForm onSuccess={handleAuthSuccess} />
                            </TabPanel>
                            <TabPanel>
                                <SignupForm onSuccess={handleAuthSuccess} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
