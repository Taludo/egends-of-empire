import { Box, Button, Flex, Heading, useDisclosure } from '@chakra-ui/react';
import { AuthModal } from '../Auth/AuthModal';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useToast } from '../../contexts/ToastContext';
import { useEffect, useState } from 'react';

export const Navbar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        // Écouter les changements d'état de l'authentification
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user);
        });

        // Nettoyer l'écouteur lors du démontage
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({
                title: "Déconnexion réussie",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate('/');
        } catch (error) {
            toast({
                title: "Erreur lors de la déconnexion",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bg="white"
            boxShadow="sm"
            zIndex={1000}
        >
            <Flex
                maxW="container.xl"
                mx="auto"
                px={4}
                h={16}
                align="center"
                justify="space-between"
            >
                <Heading 
                    size="md" 
                    cursor="pointer" 
                    onClick={handleHomeClick}
                >
                    Legends of Empire
                </Heading>

                <Box>
                    {isLoggedIn ? (
                        <Button colorScheme="red" onClick={handleLogout}>
                            Déconnexion
                        </Button>
                    ) : (
                        <Button colorScheme="blue" onClick={onOpen}>
                            Connexion
                        </Button>
                    )}
                </Box>
            </Flex>

            <AuthModal isOpen={isOpen} onClose={onClose} />
        </Box>
    );
};
