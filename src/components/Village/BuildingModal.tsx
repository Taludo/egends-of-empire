import { 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalCloseButton,
    SimpleGrid,
    Box,
    Text,
    Button,
    VStack,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { Building } from '../../types/game';
import { BUILDINGS } from '../../data/buildings';
import { FaHammer, FaClock } from 'react-icons/fa';

interface BuildingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuildingSelect: (buildingId: string) => void;
    villageLevel: number;
}

export const BuildingModal = ({ isOpen, onClose, onBuildingSelect, villageLevel }: BuildingModalProps) => {
    const handleSelect = (buildingId: string) => {
        onBuildingSelect(buildingId);
        onClose();
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Construire un bâtiment</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {Object.values(BUILDINGS).map((building) => (
                            <Box
                                key={building.id}
                                p={4}
                                borderWidth="1px"
                                borderRadius="lg"
                                _hover={{ bg: 'gray.50' }}
                                cursor="pointer"
                                onClick={() => handleSelect(building.id)}
                                opacity={building.requirements.level > villageLevel ? 0.5 : 1}
                            >
                                <VStack align="start" spacing={2}>
                                    <Text fontWeight="bold">{building.name}</Text>
                                    <Text fontSize="sm" color="gray.600">{building.description}</Text>
                                    
                                    {building.production && (
                                        <HStack>
                                            <Icon as={FaHammer} />
                                            <Text fontSize="sm">
                                                Production: {Object.entries(building.production).map(([resource, amount]) => 
                                                    `${amount} ${resource}`
                                                ).join(', ')}
                                            </Text>
                                        </HStack>
                                    )}
                                    
                                    <HStack>
                                        <Icon as={FaClock} />
                                        <Text fontSize="sm">Temps: {formatTime(building.buildTime)}</Text>
                                    </HStack>

                                    <Text fontSize="sm" mt={2}>
                                        Coût: {Object.entries(building.cost).map(([resource, amount]) => 
                                            `${amount} ${resource}`
                                        ).join(', ')}
                                    </Text>

                                    {building.requirements.level > villageLevel && (
                                        <Text color="red.500" fontSize="sm">
                                            Nécessite le niveau {building.requirements.level}
                                        </Text>
                                    )}
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
