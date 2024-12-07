import { Box, SimpleGrid, Text, Tooltip, HStack, Icon } from '@chakra-ui/react';
import { Resources, ProductionRates } from '../../types/game';
import { FaTree, FaHammer, FaMountain, FaAppleAlt } from 'react-icons/fa';

interface ResourcesDisplayProps {
    resources: Resources;
    productionRates?: ProductionRates;
}

export const ResourcesDisplay = ({ resources, productionRates }: ResourcesDisplayProps) => {
    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                Ressources
            </Text>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Tooltip label="Bois" aria-label="Bois">
                    <Box>
                        <HStack spacing={2}>
                            <Icon as={FaTree} color="green.600" />
                            <Text fontWeight="bold">{Math.floor(resources.wood)}</Text>
                        </HStack>
                        {productionRates && (
                            <Text fontSize="sm" color="green.600">
                                +{productionRates.wood}/h
                            </Text>
                        )}
                    </Box>
                </Tooltip>

                <Tooltip label="Fer" aria-label="Fer">
                    <Box>
                        <HStack spacing={2}>
                            <Icon as={FaHammer} color="gray.600" />
                            <Text fontWeight="bold">{Math.floor(resources.iron)}</Text>
                        </HStack>
                        {productionRates && (
                            <Text fontSize="sm" color="green.600">
                                +{productionRates.iron}/h
                            </Text>
                        )}
                    </Box>
                </Tooltip>

                <Tooltip label="Pierre" aria-label="Pierre">
                    <Box>
                        <HStack spacing={2}>
                            <Icon as={FaMountain} color="gray.700" />
                            <Text fontWeight="bold">{Math.floor(resources.stone)}</Text>
                        </HStack>
                        {productionRates && (
                            <Text fontSize="sm" color="green.600">
                                +{productionRates.stone}/h
                            </Text>
                        )}
                    </Box>
                </Tooltip>

                <Tooltip label="Nourriture" aria-label="Nourriture">
                    <Box>
                        <HStack spacing={2}>
                            <Icon as={FaAppleAlt} color="red.500" />
                            <Text fontWeight="bold">{Math.floor(resources.food)}</Text>
                        </HStack>
                        {productionRates && (
                            <Text fontSize="sm" color="green.600">
                                +{productionRates.food}/h
                            </Text>
                        )}
                    </Box>
                </Tooltip>
            </SimpleGrid>
        </Box>
    );
};
