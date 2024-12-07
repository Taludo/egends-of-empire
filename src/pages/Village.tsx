import { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Progress,
    SimpleGrid,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    useToast,
    Spinner,
} from '@chakra-ui/react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, setDoc, deleteField } from 'firebase/firestore';
import { UserVillage, ProductionRates } from '../types/game';
import { BuildingsList } from '../components/Village/BuildingsList';
import { ResourcesDisplay } from '../components/Village/ResourcesDisplay';
import { VillageMap } from '../components/Village/VillageMap';
import { useNavigate } from 'react-router-dom';
import { FaTree, FaHammer, FaMountain, FaWarehouse } from 'react-icons/fa';
import { BuildingModal } from '../components/Village/BuildingModal';
import { ProductionStats } from '../components/Village/ProductionStats';
import { SpeedUpPoints } from '../components/Village/SpeedUpPoints';
import { BuildingDetails } from '../components/Village/BuildingDetails';

const BASE_PRODUCTION_RATES: ProductionRates = {
    wood: 10,
    iron: 8,
    stone: 7,
    food: 12,
};

const BUILDING_PRODUCTION_BONUS = {
    woodcutter: { resource: 'wood', amount: 5 },
    ironMine: { resource: 'iron', amount: 4 },
    quarry: { resource: 'stone', amount: 3 },
    farm: { resource: 'food', amount: 6 },
};

const BUILDINGS = {
    woodcutter: {
        name: 'Scierie',
        requirements: { level: 1 },
        cost: { wood: 100, iron: 50 },
        buildTime: 3600, // 1 heure
    },
    ironMine: {
        name: 'Mine de fer',
        requirements: { level: 2 },
        cost: { wood: 150, stone: 100 },
        buildTime: 7200, // 2 heures
    },
    quarry: {
        name: 'Carrière',
        requirements: { level: 3 },
        cost: { wood: 200, iron: 100 },
        buildTime: 10800, // 3 heures
    },
    farm: {
        name: 'Ferme',
        requirements: { level: 1 },
        cost: { wood: 50, food: 100 },
        buildTime: 1800, // 30 minutes
    },
};

export const Village = () => {
    const [village, setVillage] = useState<UserVillage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [productionRates, setProductionRates] = useState<ProductionRates>(BASE_PRODUCTION_RATES);
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
    const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingInstance | null>(null);
    const [isBuildingDetailsOpen, setIsBuildingDetailsOpen] = useState(false);

    const calculateProductionRates = (villageData: UserVillage): ProductionRates => {
        const rates = { ...BASE_PRODUCTION_RATES };
        
        // Appliquer les bonus de village
        if (villageData.type === 'roman') {
            rates.iron *= 1.2; // +20% de production de fer
        } else if (villageData.type === 'gaulois') {
            rates.wood *= 1.2; // +20% de production de bois
        } else if (villageData.type === 'teuton') {
            rates.stone *= 1.2; // +20% de production de pierre
        }

        // Appliquer les bonus des bâtiments
        Object.entries(villageData.buildings || {}).forEach(([_, building]) => {
            if (building.id === 'woodcutter') {
                rates.wood += 5 * building.level;
            } else if (building.id === 'ironMine') {
                rates.iron += 4 * building.level;
            } else if (building.id === 'quarry') {
                rates.stone += 3 * building.level;
            } else if (building.id === 'farm') {
                rates.food += 6 * building.level;
            }
        });

        return rates;
    };

    const updateResources = async (villageData: UserVillage): Promise<UserVillage> => {
        try {
            if (!villageData.lastResourceUpdate) {
                villageData.lastResourceUpdate = Timestamp.now();
                return villageData;
            }

            const now = Timestamp.now();
            const lastUpdate = villageData.lastResourceUpdate;
            const secondsPassed = now.seconds - lastUpdate.seconds;
            const hoursPassed = secondsPassed / 3600;

            if (hoursPassed > 0) {
                const rates = calculateProductionRates(villageData);
                const newResources = { ...villageData.resources };

                // Calculer la nouvelle production
                Object.entries(rates).forEach(([resource, rate]) => {
                    const production = rate * hoursPassed;
                    newResources[resource as keyof Resources] = Math.floor(
                        villageData.resources[resource as keyof Resources] + production
                    );
                });

                // Créer l'objet village mis à jour
                const updatedVillage = {
                    ...villageData,
                    resources: newResources,
                    lastResourceUpdate: now,
                };

                // Mettre à jour dans Firestore
                const villageRef = doc(db, 'villages', villageData.id);
                await updateDoc(villageRef, {
                    resources: newResources,
                    lastResourceUpdate: now,
                });

                return updatedVillage;
            }

            return villageData;
        } catch (error) {
            console.error("Erreur lors de la mise à jour des ressources:", error);
            throw error;
        }
    };

    const handleBuildingClick = (position: number) => {
        const building = village?.buildings[position];
        if (!building) {
            // Ouvrir le modal de construction pour les emplacements vides
            setSelectedPosition(position);
            setIsBuildingModalOpen(true);
        } else {
            // Ouvrir le modal de détails pour les bâtiments existants
            setSelectedBuilding(building);
            setIsBuildingDetailsOpen(true);
        }
    };

    const handleBuildingSelect = async (buildingId: string) => {
        if (!village || selectedPosition === null) return;

        try {
            // Vérifier si le bâtiment existe dans notre liste
            if (!BUILDINGS[buildingId]) {
                console.error(`Bâtiment non trouvé: ${buildingId}`);
                toast({
                    title: "Erreur",
                    description: "Ce type de bâtiment n'existe pas",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            const building = BUILDINGS[buildingId];

            // Vérifier si un bâtiment existe déjà à cette position
            if (village.buildings[selectedPosition]) {
                toast({
                    title: "Position occupée",
                    description: "Un bâtiment existe déjà à cet emplacement",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            // Vérifier le niveau requis
            if (building.requirements.level > village.level) {
                toast({
                    title: "Niveau insuffisant",
                    description: `Ce bâtiment nécessite le niveau ${building.requirements.level}`,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            // Mettre à jour les ressources avant de vérifier
            const updatedVillage = await updateResources(village);

            // Vérifier les ressources
            for (const [resource, amount] of Object.entries(building.cost)) {
                if (updatedVillage.resources[resource as keyof Resources] < amount) {
                    toast({
                        title: "Ressources insuffisantes",
                        description: `Il vous manque des ressources pour construire ce bâtiment`,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
            }

            // Déduire les ressources
            const newResources = { ...updatedVillage.resources };
            for (const [resource, amount] of Object.entries(building.cost)) {
                newResources[resource as keyof Resources] -= amount;
            }

            // Créer l'instance du bâtiment
            const now = Timestamp.now();
            const buildingInstance: BuildingInstance = {
                id: buildingId,
                level: 1,
                constructionStartTime: now,
                constructionEndTime: Timestamp.fromMillis(now.toMillis() + building.buildTime * 1000)
            };

            // Mettre à jour les bâtiments
            const newBuildings = {
                ...updatedVillage.buildings,
                [selectedPosition]: buildingInstance
            };

            // Mettre à jour le village dans Firestore
            const villageRef = doc(db, 'villages', updatedVillage.id);
            await updateDoc(villageRef, {
                resources: newResources,
                buildings: newBuildings,
                lastResourceUpdate: now
            });

            // Mettre à jour l'état local
            setVillage({
                ...updatedVillage,
                resources: newResources,
                buildings: newBuildings,
                lastResourceUpdate: now
            });

            toast({
                title: "Construction lancée",
                description: `La construction du ${building.name} a commencé`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            setIsBuildingModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la construction:', error);
            toast({
                title: "Erreur",
                description: "Impossible de construire le bâtiment",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleConstructionComplete = async (position: number) => {
        if (!village) return;

        try {
            // Mettre à jour le bâtiment terminé
            const completedBuilding = village.buildings[position];
            if (!completedBuilding) return;

            // Mettre à jour l'état du bâtiment
            const updatedBuildings = { ...village.buildings };
            delete completedBuilding.constructionStartTime;
            delete completedBuilding.constructionEndTime;
            updatedBuildings[position] = completedBuilding;

            // Mettre à jour Firestore
            const villageRef = doc(db, 'villages', village.id);
            await updateDoc(villageRef, {
                buildings: updatedBuildings
            });

            // Mettre à jour l'état local
            setVillage({
                ...village,
                buildings: updatedBuildings
            });

        } catch (error) {
            console.error('Erreur lors de la finalisation de la construction:', error);
            toast({
                title: "Erreur",
                description: "Impossible de finaliser la construction",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleSpeedUpConstruction = async (building: BuildingInstance, position: number, usePoints: boolean) => {
        if (!village) return;

        // Si on utilise des points d'accélération
        if (usePoints) {
            if (village.speedUpPoints < 1) {
                toast({
                    title: "Points insuffisants",
                    description: "Vous n'avez pas assez de points d'accélération",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // Terminer immédiatement la construction
            const updatedBuilding = {
                ...building,
                constructionEndTime: Timestamp.now(),
                speedUpCount: (building.speedUpCount || 0) + 1,
            };
            delete updatedBuilding.constructionStartTime;

            // Mettre à jour le village
            const updatedVillage = {
                ...village,
                buildings: {
                    ...village.buildings,
                    [position]: updatedBuilding,
                },
                speedUpPoints: village.speedUpPoints - 1,
            };

            // Sauvegarder dans Firebase
            try {
                await updateDoc(doc(db, 'villages', village.id), {
                    [`buildings.${position}.constructionEndTime`]: Timestamp.now(),
                    [`buildings.${position}.constructionStartTime`]: deleteField(),
                    [`buildings.${position}.speedUpCount`]: (building.speedUpCount || 0) + 1,
                    speedUpPoints: village.speedUpPoints - 1,
                });

                setVillage(updatedVillage);
                handleConstructionComplete(position);
                toast({
                    title: "Construction terminée !",
                    description: "1 point d'accélération utilisé pour terminer la construction",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error('Error updating village:', error);
                toast({
                    title: "Erreur",
                    description: "Impossible de terminer la construction",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
            return;
        }

        // Si on utilise des ressources (code existant)
        const speedUpCount = building.speedUpCount || 0;
        const cost = {
            wood: Math.floor(100 * Math.pow(1.5, speedUpCount)),
            stone: Math.floor(50 * Math.pow(1.5, speedUpCount)),
            iron: Math.floor(30 * Math.pow(1.5, speedUpCount)),
        };

        // Vérifier si on a assez de ressources
        if (Object.entries(cost).some(([resource, amount]) => 
            (village.resources[resource as keyof Resources] || 0) < amount
        )) {
            toast({
                title: "Ressources insuffisantes",
                description: "Vous n'avez pas assez de ressources pour accélérer la construction",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Déduire les ressources
        const newResources = { ...village.resources };
        Object.entries(cost).forEach(([resource, amount]) => {
            newResources[resource as keyof Resources] = 
                (newResources[resource as keyof Resources] || 0) - amount;
        });

        // Mettre à jour le temps de construction
        const currentTime = Timestamp.now().toMillis();
        const endTime = building.constructionEndTime?.toMillis() || currentTime;
        const newEndTime = Math.max(
            currentTime + 10000, // minimum 10 secondes
            endTime - 5 * 60 * 1000 // réduire de 5 minutes
        );

        // Mettre à jour le bâtiment
        const updatedBuilding = {
            ...building,
            constructionEndTime: Timestamp.fromMillis(newEndTime),
            speedUpCount: speedUpCount + 1,
        };

        // Mettre à jour le village
        const updatedVillage = {
            ...village,
            buildings: {
                ...village.buildings,
                [position]: updatedBuilding,
            },
            resources: newResources,
        };

        // Sauvegarder dans Firebase
        try {
            await updateDoc(doc(db, 'villages', village.id), {
                buildings: updatedVillage.buildings,
                resources: updatedVillage.resources,
            });

            setVillage(updatedVillage);
            toast({
                title: "Construction accélérée",
                description: "Ressources déduites",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error updating village:', error);
            toast({
                title: "Erreur",
                description: "Impossible d'accélérer la construction",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleUpgrade = async () => {
        // TODO: Implémenter la logique d'amélioration
        toast({
            title: "Fonctionnalité à venir",
            description: "L'amélioration des bâtiments sera bientôt disponible !",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleDestroyBuilding = async (position: number) => {
        if (!village) return;

        try {
            // Créer une copie profonde des bâtiments
            const updatedBuildings = JSON.parse(JSON.stringify(village.buildings));
            delete updatedBuildings[position];

            // Créer un nouvel objet village avec les bâtiments mis à jour
            const newVillage = {
                ...village,
                buildings: updatedBuildings
            };

            // Mettre à jour Firestore
            const villageRef = doc(db, 'villages', village.id);
            await updateDoc(villageRef, {
                buildings: updatedBuildings
            });

            // Mettre à jour l'état local
            setVillage(null); // Force un re-render complet
            setTimeout(() => {
                setVillage(newVillage);
                // Recalculer les taux de production
                const newRates = calculateProductionRates(newVillage);
                setProductionRates(newRates);
            }, 0);

            // Fermer le modal et réinitialiser les sélections
            setIsBuildingDetailsOpen(false);
            setSelectedBuilding(null);
            setSelectedPosition(null);

            toast({
                title: "Bâtiment détruit",
                description: "Le bâtiment a été détruit avec succès.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Erreur lors de la destruction du bâtiment:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la destruction du bâtiment.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        const fetchVillage = async () => {
            if (!auth.currentUser) {
                navigate('/');
                return;
            }

            try {
                setIsLoading(true);
                const villagesRef = collection(db, 'villages');
                const q = query(villagesRef, where('userId', '==', auth.currentUser.uid));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    toast({
                        title: "Aucun village trouvé",
                        description: "Veuillez créer un village sur la page d'accueil",
                        status: "warning",
                        duration: 5000,
                        isClosable: true,
                    });
                    navigate('/');
                    return;
                }

                const villageDoc = querySnapshot.docs[0];
                const villageData = {
                    id: villageDoc.id,
                    ...villageDoc.data()
                } as UserVillage;

                // Mettre à jour les ressources en fonction du temps écoulé
                const updatedVillage = await updateResources(villageData);
                setVillage(updatedVillage);
                
                // Calculer les taux de production
                setProductionRates(calculateProductionRates(updatedVillage));

            } catch (error) {
                console.error("Erreur lors de la récupération du village:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger le village",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVillage();
        const interval = setInterval(fetchVillage, 60000); // Rafraîchir toutes les minutes

        return () => clearInterval(interval);
    }, [navigate, toast]);

    if (isLoading) {
        return (
            <Container maxW="container.xl" py={10}>
                <VStack spacing={8} align="center">
                    <Heading>Legends of Empire</Heading>
                    <Text>Chargement de votre village...</Text>
                    <Spinner size="xl" />
                </VStack>
            </Container>
        );
    }

    if (!village) {
        return null;
    }

    return (
        <Container maxW="container.xl" py={5}>
            <VStack spacing={5} align="stretch">
                <HStack justify="space-between" align="center">
                    <Heading size="lg">{village.name}</Heading>
                    <HStack spacing={4}>
                        <SpeedUpPoints points={village.speedUpPoints} />
                        <ResourcesDisplay resources={village.resources} productionRates={productionRates} />
                    </HStack>
                </HStack>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                    <ProductionStats village={village} />
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="lg">
                    <VillageMap 
                        buildings={village.buildings} 
                        onConstructionComplete={handleConstructionComplete}
                        onSpeedUpConstruction={handleSpeedUpConstruction}
                        onBuildingClick={handleBuildingClick}
                        availablePoints={village.speedUpPoints}
                        resources={village.resources}
                    />
                </Box>

                <Modal isOpen={isBuildingModalOpen} onClose={() => setIsBuildingModalOpen(false)}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Choisir un bâtiment</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <BuildingModal
                                isOpen={isBuildingModalOpen}
                                onClose={() => setIsBuildingModalOpen(false)}
                                onBuildingSelect={handleBuildingSelect}
                                villageLevel={village.level}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>

                {/* Modal de détails du bâtiment */}
                {selectedBuilding && (
                    <BuildingDetails
                        building={selectedBuilding}
                        position={selectedPosition || 0}
                        isOpen={isBuildingDetailsOpen}
                        onClose={() => {
                            setIsBuildingDetailsOpen(false);
                            setSelectedBuilding(null);
                        }}
                        onUpgrade={handleUpgrade}
                        onDestroy={handleDestroyBuilding}
                    />
                )}
            </VStack>
        </Container>
    );
};
