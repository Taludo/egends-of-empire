import { 
    SimpleGrid, 
    Box, 
    Text, 
    VStack,
    useColorModeValue,
    Icon
} from '@chakra-ui/react';
import { BuildingInstance, Building } from '../../types/game';
import { BUILDINGS } from '../../data/buildings';
import { BuildingProgress } from './BuildingProgress';
import { Timestamp } from 'firebase/firestore';

interface VillageMapProps {
    buildings: { [key: number]: BuildingInstance };
    onConstructionComplete: (position: number) => void;
    onSpeedUpConstruction: (building: BuildingInstance, position: number, usePoints: boolean) => void;
    onBuildingClick: (position: number) => void;
    availablePoints: number;
    resources: any; 
}

export const VillageMap = ({ 
    buildings, 
    onConstructionComplete, 
    onSpeedUpConstruction,
    onBuildingClick,
    availablePoints,
    resources 
}: VillageMapProps) => {
    const emptyBgColor = useColorModeValue('gray.100', 'gray.700');
    const buildingBgColor = useColorModeValue('green.100', 'green.700');
    const constructionBgColor = useColorModeValue('yellow.100', 'yellow.700');

    const handleConstructionComplete = (position: number) => {
        onConstructionComplete(position);
    };

    const isConstructionComplete = (building: BuildingInstance): boolean => {
        if (!building.constructionEndTime || !building.constructionStartTime) {
            return true;
        }
        return Timestamp.now().toMillis() >= building.constructionEndTime.toMillis();
    };

    const renderCell = (index: number) => {
        const building = buildings[index];
        const isUnderConstruction = building && !isConstructionComplete(building);
        const bgColor = building 
            ? isUnderConstruction 
                ? constructionBgColor 
                : buildingBgColor
            : emptyBgColor;

        return (
            <Box
                key={index}
                bg={bgColor}
                w="100%"
                h="150px"
                borderRadius="md"
                border="1px"
                borderColor="gray.200"
                p={2}
                cursor="pointer"
                onClick={(e) => {
                    // Ne pas propager le clic si on clique sur le composant BuildingProgress
                    if (!(e.target as HTMLElement).closest('.building-progress')) {
                        onBuildingClick(index);
                    }
                }}
                position="relative"
                _hover={{
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s',
                }}
            >
                {building && (
                    <Box
                        w="100%"
                        h="100%"
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        borderRadius="md"
                        p={2}
                    >
                        {!isConstructionComplete(building) && (
                            <Box className="building-progress">
                                <BuildingProgress
                                    building={building}
                                    onConstructionComplete={() => handleConstructionComplete(index)}
                                    onSpeedUp={(usePoints) => onSpeedUpConstruction(building, index, usePoints)}
                                    availablePoints={availablePoints}
                                    currentResources={resources}
                                />
                            </Box>
                        )}
                        {isConstructionComplete(building) && (
                            <VStack spacing={1} align="center">
                                <Icon 
                                    as={BUILDINGS[building.id].icon} 
                                    boxSize={8} 
                                    color="gray.600"
                                />
                                <Text fontSize="sm" fontWeight="bold">
                                    {BUILDINGS[building.id].name}
                                </Text>
                                <Text fontSize="xs">
                                    Niveau {building.level}
                                </Text>
                            </VStack>
                        )}
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <SimpleGrid columns={3} spacing={4} w="100%">
            {Array.from({ length: 9 }, (_, i) => renderCell(i))}
        </SimpleGrid>
    );
};
