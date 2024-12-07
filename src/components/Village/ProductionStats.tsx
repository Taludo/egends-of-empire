import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    VStack,
    HStack,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Divider,
    useColorModeValue,
} from '@chakra-ui/react';
import { GiWoodPile, GiAnvil, GiStonePile, GiWheat, GiTwoCoins } from 'react-icons/gi';
import { UserVillage, BuildingInstance, Resources } from '../../types/game';
import { BUILDINGS } from '../../data/buildings';

interface ProductionStatsProps {
    village: UserVillage;
}

interface ResourceIconMapping {
    [key: string]: any;
    wood: typeof GiWoodPile;
    iron: typeof GiAnvil;
    stone: typeof GiStonePile;
    food: typeof GiWheat;
    gold: typeof GiTwoCoins;
}

const RESOURCE_ICONS: ResourceIconMapping = {
    wood: GiWoodPile,
    iron: GiAnvil,
    stone: GiStonePile,
    food: GiWheat,
    gold: GiTwoCoins,
};

export const ProductionStats = ({ village }: ProductionStatsProps) => {
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const headerBg = useColorModeValue('gray.50', 'gray.700');

    // Calculer la production par bâtiment
    const calculateBuildingProduction = (building: BuildingInstance): Partial<Resources> => {
        const buildingData = BUILDINGS[building.id];
        const production: Partial<Resources> = {};
        
        if (buildingData.production) {
            for (const [resource, baseAmount] of Object.entries(buildingData.production)) {
                // La production augmente de 20% par niveau
                production[resource as keyof Resources] = baseAmount * Math.pow(1.2, building.level - 1);
            }
        }
        
        return production;
    };

    // Calculer la production totale
    const calculateTotalProduction = () => {
        const totals: Resources = {
            wood: 0,
            iron: 0,
            stone: 0,
            food: 0,
            gold: 0,
        };

        Object.values(village.buildings).forEach(building => {
            const production = calculateBuildingProduction(building);
            Object.entries(production).forEach(([resource, amount]) => {
                totals[resource as keyof Resources] += amount || 0;
            });
        });

        // Ajouter les bonus du village
        Object.keys(totals).forEach(resource => {
            const bonus = village.bonuses?.[resource as keyof Resources] || 0;
            totals[resource as keyof Resources] *= (1 + bonus);
        });

        return totals;
    };

    const totalProduction = calculateTotalProduction();

    return (
        <VStack spacing={6} align="stretch" w="100%">
            <Box>
                <Text fontSize="xl" fontWeight="bold" mb={4}>Production Totale par Heure</Text>
                <StatGroup>
                    {Object.entries(totalProduction).map(([resource, amount]) => {
                        const ResourceIcon = RESOURCE_ICONS[resource];
                        return (
                            <Stat key={resource}>
                                <StatLabel>
                                    <HStack>
                                        <Icon as={ResourceIcon} />
                                        <Text textTransform="capitalize">{resource}</Text>
                                    </HStack>
                                </StatLabel>
                                <StatNumber>{Math.round(amount * 10) / 10}/h</StatNumber>
                            </Stat>
                        );
                    })}
                </StatGroup>
            </Box>

            <Divider />

            <Box>
                <Text fontSize="xl" fontWeight="bold" mb={4}>Production par Bâtiment</Text>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg={headerBg}>
                            <Tr>
                                <Th>Bâtiment</Th>
                                <Th>Niveau</Th>
                                {Object.keys(RESOURCE_ICONS).map(resource => (
                                    <Th key={resource} isNumeric>
                                        <Icon as={RESOURCE_ICONS[resource]} />
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {Object.entries(village.buildings).map(([position, building]) => {
                                const production = calculateBuildingProduction(building);
                                return (
                                    <Tr key={position}>
                                        <Td>{BUILDINGS[building.id].name}</Td>
                                        <Td>{building.level}</Td>
                                        {Object.keys(RESOURCE_ICONS).map(resource => (
                                            <Td key={resource} isNumeric>
                                                {production[resource as keyof Resources] 
                                                    ? Math.round(production[resource as keyof Resources]! * 10) / 10 
                                                    : '-'}
                                            </Td>
                                        ))}
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </Box>

            {village.bonuses && Object.keys(village.bonuses).length > 0 && (
                <>
                    <Divider />
                    <Box>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>Bonus de Production</Text>
                        <StatGroup>
                            {Object.entries(village.bonuses).map(([resource, bonus]) => {
                                const ResourceIcon = RESOURCE_ICONS[resource];
                                return (
                                    <Stat key={resource}>
                                        <StatLabel>
                                            <HStack>
                                                <Icon as={ResourceIcon} />
                                                <Text textTransform="capitalize">{resource}</Text>
                                            </HStack>
                                        </StatLabel>
                                        <StatNumber>+{Math.round(bonus * 100)}%</StatNumber>
                                    </Stat>
                                );
                            })}
                        </StatGroup>
                    </Box>
                </>
            )}
        </VStack>
    );
};
