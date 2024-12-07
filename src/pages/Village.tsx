import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import {
    Container,
    Grid,
    GridItem,
    VStack,
    Heading,
    Text,
    useToast,
} from '@chakra-ui/react';
import { VillageMap } from '../components/Village/VillageMap';
import { BuildingModal } from '../components/Village/BuildingModal';
import { BuildingDetails } from '../components/Village/BuildingDetails';
import { ResourceDisplay } from '../components/Village/ResourceDisplay';
import { ProductionStats } from '../components/Village/ProductionStats';
import { BUILDINGS } from '../data/buildings';
import { UserVillage, BuildingInstance } from '../types/game';

export const Village = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [village, setVillage] = useState<UserVillage | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
    const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingInstance | null>(null);

    useEffect(() => {
        const fetchVillage = async () => {
            if (!currentUser) {
                navigate('/login');
                return;
            }

            try {
                const villagesRef = collection(db, 'villages');
                const q = query(villagesRef, where('userId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    navigate('/');
                    return;
                }

                const villageData = querySnapshot.docs[0].data() as UserVillage;
                villageData.id = querySnapshot.docs[0].id;
                setVillage(villageData);
            } catch (error) {
                console.error('Erreur lors de la récupération du village:', error);
                toast({
                    title: 'Erreur',
                    description: 'Impossible de charger votre village.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        };

        fetchVillage();
    }, [currentUser, navigate, toast]);

    const handleBuildingClick = (position: number, building?: BuildingInstance) => {
        if (building) {
            setSelectedBuilding(building);
            setSelectedPosition(position);
        } else {
            setSelectedPosition(position);
            setIsBuildingModalOpen(true);
        }
    };

    const handleBuildingSelect = async (buildingType: string) => {
        if (!village || selectedPosition === null) return;

        const buildingInfo = BUILDINGS[buildingType];
        if (!buildingInfo) return;

        // Vérifier si l'utilisateur a assez de ressources
        for (const [resource, amount] of Object.entries(buildingInfo.cost)) {
            if (village.resources[resource] < amount) {
                toast({
                    title: 'Ressources insuffisantes',
                    description: `Vous n'avez pas assez de ${resource} pour construire ce bâtiment.`,
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
        }

        try {
            // Créer une nouvelle instance de bâtiment
            const newBuilding: BuildingInstance = {
                type: buildingType,
                level: 1,
                constructionStartTime: new Date(),
                constructionEndTime: new Date(Date.now() + buildingInfo.buildTime * 1000),
            };

            // Mettre à jour les ressources
            const updatedResources = { ...village.resources };
            for (const [resource, amount] of Object.entries(buildingInfo.cost)) {
                updatedResources[resource] -= amount;
            }

            // Mettre à jour les bâtiments
            const updatedBuildings = { ...village.buildings };
            updatedBuildings[selectedPosition] = newBuilding;

            // Mettre à jour le village dans Firestore
            const villageRef = doc(db, 'villages', village.id);
            await updateDoc(villageRef, {
                buildings: updatedBuildings,
                resources: updatedResources,
            });

            // Mettre à jour l'état local
            setVillage({
                ...village,
                buildings: updatedBuildings,
                resources: updatedResources,
            });

            setIsBuildingModalOpen(false);
            toast({
                title: 'Construction lancée',
                description: `La construction de ${buildingInfo.name} a commencé.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Erreur lors de la construction:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de lancer la construction.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleConstructionComplete = async (position: number) => {
        if (!village) return;

        try {
            const updatedBuildings = { ...village.buildings };
            if (updatedBuildings[position]) {
                delete updatedBuildings[position].constructionStartTime;
                delete updatedBuildings[position].constructionEndTime;
            }

            const villageRef = doc(db, 'villages', village.id);
            await updateDoc(villageRef, {
                buildings: updatedBuildings,
            });

            setVillage({
                ...village,
                buildings: updatedBuildings,
            });

            toast({
                title: 'Construction terminée',
                description: 'Le bâtiment est maintenant terminé !',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Erreur lors de la finalisation de la construction:', error);
        }
    };

    const handleSpeedUpConstruction = async (building: BuildingInstance, position: number, usePoints: boolean) => {
        if (!village) return;

        try {
            const updatedBuildings = { ...village.buildings };
            const updatedResources = { ...village.resources };
            let updatedSpeedUpPoints = village.speedUpPoints;

            if (usePoints) {
                if (updatedSpeedUpPoints <= 0) {
                    toast({
                        title: 'Points insuffisants',
                        description: 'Vous n\'avez plus de points d\'accélération.',
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
                updatedSpeedUpPoints--;
            } else {
                // Logique pour le coût en ressources
                const speedUpCost = {
                    wood: 100,
                    stone: 50,
                    iron: 30,
                };

                for (const [resource, amount] of Object.entries(speedUpCost)) {
                    if (village.resources[resource] < amount) {
                        toast({
                            title: 'Ressources insuffisantes',
                            description: `Vous n'avez pas assez de ${resource} pour accélérer la construction.`,
                            status: 'warning',
                            duration: 5000,
                            isClosable: true,
                        });
                        return;
                    }
                    updatedResources[resource] -= amount;
                }
            }

            if (updatedBuildings[position]) {
                delete updatedBuildings[position].constructionStartTime;
                delete updatedBuildings[position].constructionEndTime;
            }

            const villageRef = doc(db, 'villages', village.id);
            await updateDoc(villageRef, {
                buildings: updatedBuildings,
                resources: updatedResources,
                speedUpPoints: updatedSpeedUpPoints,
            });

            setVillage({
                ...village,
                buildings: updatedBuildings,
                resources: updatedResources,
                speedUpPoints: updatedSpeedUpPoints,
            });

            toast({
                title: 'Construction accélérée',
                description: 'La construction est maintenant terminée !',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Erreur lors de l\'accélération de la construction:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible d\'accélérer la construction.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (!village) {
        return (
            <Container maxW="container.xl" py={8}>
                <VStack spacing={8}>
                    <Heading>Chargement...</Heading>
                </VStack>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <Grid templateColumns="repeat(3, 1fr)" gap={8}>
                <GridItem colSpan={2}>
                    <VStack spacing={8} align="stretch">
                        <Heading size="lg">{village.name}</Heading>
                        <Text>Niveau {village.level}</Text>
                        <ResourceDisplay resources={village.resources} />
                        <VillageMap
                            buildings={village.buildings}
                            onBuildingClick={handleBuildingClick}
                        />
                    </VStack>
                </GridItem>

                <GridItem>
                    <VStack spacing={8} align="stretch">
                        <ProductionStats
                            resources={village.resources}
                            productionRates={{
                                wood: 20,
                                stone: 15,
                                iron: 10,
                                food: 25,
                            }}
                        />
                        {selectedBuilding && selectedPosition !== null && (
                            <BuildingDetails
                                building={selectedBuilding}
                                position={selectedPosition}
                                onConstructionComplete={handleConstructionComplete}
                                onSpeedUpConstruction={handleSpeedUpConstruction}
                                speedUpPoints={village.speedUpPoints}
                                resources={village.resources}
                            />
                        )}
                    </VStack>
                </GridItem>
            </Grid>

            <BuildingModal
                isOpen={isBuildingModalOpen}
                onClose={() => setIsBuildingModalOpen(false)}
                onBuildingSelect={handleBuildingSelect}
                villageLevel={village.level}
            />
        </Container>
    );
};
