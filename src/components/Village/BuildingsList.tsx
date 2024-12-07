import {
    Box,
    VStack,
    Text,
    Button,
    SimpleGrid,
    Progress,
} from '@chakra-ui/react';
import { UserVillage } from '../../types/game';
import { useState } from 'react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../contexts/ToastContext';

interface BuildingsListProps {
    village: UserVillage;
    onUpdate: (village: UserVillage) => void;
}

interface Building {
    id: string;
    name: string;
    description: string;
    woodCost: number;
    ironCost: number;
    stoneCost: number;
    foodCost: number;
    productionBonus: {
        resource: keyof typeof ResourceProductionRates;
        amount: number;
    };
}

const ResourceProductionRates = {
    wood: 10,
    iron: 8,
    stone: 7,
    food: 12,
};

const buildings: Building[] = [
    {
        id: 'woodcutter',
        name: 'Bûcheron',
        description: 'Augmente la production de bois',
        woodCost: 50,
        ironCost: 30,
        stoneCost: 40,
        foodCost: 20,
        productionBonus: { resource: 'wood', amount: 5 },
    },
    {
        id: 'ironMine',
        name: 'Mine de fer',
        description: 'Augmente la production de fer',
        woodCost: 40,
        ironCost: 50,
        stoneCost: 40,
        foodCost: 20,
        productionBonus: { resource: 'iron', amount: 4 },
    },
    {
        id: 'quarry',
        name: 'Carrière',
        description: 'Augmente la production de pierre',
        woodCost: 40,
        ironCost: 30,
        stoneCost: 60,
        foodCost: 20,
        productionBonus: { resource: 'stone', amount: 3 },
    },
    {
        id: 'farm',
        name: 'Ferme',
        description: 'Augmente la production de nourriture',
        woodCost: 30,
        ironCost: 20,
        stoneCost: 30,
        foodCost: 50,
        productionBonus: { resource: 'food', amount: 6 },
    },
];

export const BuildingsList = ({ village, onUpdate }: BuildingsListProps) => {
    const [isBuilding, setIsBuilding] = useState(false);
    const toast = useToast();

    const canAfford = (building: Building) => {
        return (
            village.resources.wood >= building.woodCost &&
            village.resources.iron >= building.ironCost &&
            village.resources.stone >= building.stoneCost &&
            village.resources.food >= building.foodCost
        );
    };

    const handleBuild = async (building: Building) => {
        if (!canAfford(building)) {
            toast({
                title: 'Ressources insuffisantes',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsBuilding(true);
        try {
            // Récupérer d'abord le document du village
            const villagesRef = collection(db, 'villages');
            const q = query(villagesRef, where('userId', '==', village.userId));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                throw new Error('Village non trouvé');
            }

            const villageDoc = querySnapshot.docs[0];
            const newResources = {
                wood: village.resources.wood - building.woodCost,
                iron: village.resources.iron - building.ironCost,
                stone: village.resources.stone - building.stoneCost,
                food: village.resources.food - building.foodCost,
            };

            const updatedVillage = {
                ...village,
                resources: newResources,
                level: village.level + 1,
            };

            // Utiliser l'ID du document pour la mise à jour
            await updateDoc(doc(db, 'villages', villageDoc.id), updatedVillage);
            onUpdate(updatedVillage);

            toast({
                title: 'Construction réussie',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Erreur lors de la construction:', error);
            toast({
                title: 'Erreur lors de la construction',
                description: 'Impossible de construire le bâtiment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsBuilding(false);
        }
    };

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                Bâtiments disponibles
            </Text>
            <VStack spacing={4} align="stretch">
                {isBuilding && <Progress size="xs" isIndeterminate />}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {buildings.map((building) => (
                        <Box
                            key={building.id}
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            backgroundColor={canAfford(building) ? 'white' : 'gray.50'}
                        >
                            <Text fontWeight="bold">{building.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                                {building.description}
                            </Text>
                            <Text fontSize="sm" mt={2}>
                                Coût:
                                <br />
                                Bois: {building.woodCost}
                                <br />
                                Fer: {building.ironCost}
                                <br />
                                Pierre: {building.stoneCost}
                                <br />
                                Nourriture: {building.foodCost}
                            </Text>
                            <Button
                                mt={3}
                                colorScheme="blue"
                                size="sm"
                                isDisabled={!canAfford(building) || isBuilding}
                                onClick={() => handleBuild(building)}
                                width="full"
                            >
                                Construire
                            </Button>
                        </Box>
                    ))}
                </SimpleGrid>
            </VStack>
        </Box>
    );
};
