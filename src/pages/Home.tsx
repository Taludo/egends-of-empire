import { Container, Heading, SimpleGrid, Text, VStack, useDisclosure } from '@chakra-ui/react';
import { availableVillages } from '../data/villages';
import { VillageCard } from '../components/VillageCard';
import { Village } from '../types/game';
import { auth, db } from '../firebase';
import { collection, doc, setDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../components/Auth/AuthModal';
import { useState } from 'react';

export const Home = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

    const handleVillageSelect = async (village: Village) => {
        if (!auth.currentUser) {
            // Stocker le village sélectionné et ouvrir le modal d'authentification
            setSelectedVillage(village);
            onOpen();
            return;
        }

        await createVillage(village);
    };

    const createVillage = async (selectedVillage: Village) => {
        try {
            if (!auth.currentUser) {
                throw new Error("Utilisateur non connecté");
            }

            // Vérifier si l'utilisateur a déjà un village
            const villagesRef = collection(db, 'villages');
            const q = query(villagesRef, where('userId', '==', auth.currentUser.uid));
            const existingVillages = await getDocs(q);

            if (!existingVillages.empty) {
                navigate('/village');
                return;
            }

            // Créer un nouveau village avec un ID auto-généré
            const newVillageRef = doc(collection(db, 'villages'));
            const villageData: UserVillage = {
                id: newVillageRef.id,
                userId: auth.currentUser.uid,
                name: selectedVillage.name,
                type: selectedVillage.id,
                level: 1,
                bonus: selectedVillage.bonus,
                resources: {
                    wood: 200,
                    iron: 150,
                    stone: 150,
                    food: 200,
                },
                buildings: {},
                lastResourceUpdate: Timestamp.now(),
            };

            // Sauvegarder le village dans Firestore
            await setDoc(newVillageRef, {
                ...villageData,
                createdAt: Timestamp.now(),
            });

            toast({
                title: "Village créé !",
                description: `Votre ${selectedVillage.name} a été créé avec succès !`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            navigate('/village');
        } catch (error) {
            console.error('Erreur lors de la création du village:', error);
            toast({
                title: "Erreur",
                description: "Impossible de créer le village. Veuillez réessayer.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Fonction appelée après une connexion réussie
    const handleAuthSuccess = async () => {
        onClose();
        if (selectedVillage && auth.currentUser) {
            await createVillage(selectedVillage);
        }
    };

    return (
        <Container maxW="container.xl" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading textAlign="center">Legends of Empire</Heading>
                <Text textAlign="center" fontSize="lg">
                    Choisissez votre village et commencez votre aventure !
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {availableVillages.map((village) => (
                        <VillageCard
                            key={village.id}
                            village={village}
                            onSelect={handleVillageSelect}
                        />
                    ))}
                </SimpleGrid>
            </VStack>

            <AuthModal 
                isOpen={isOpen} 
                onClose={onClose} 
                onAuthSuccess={handleAuthSuccess}
                defaultTab="signup"
            />
        </Container>
    );
};
