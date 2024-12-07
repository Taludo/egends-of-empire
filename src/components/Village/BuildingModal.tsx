import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    SimpleGrid,
    VStack,
    Text,
    Icon,
} from '@chakra-ui/react';
import { BUILDINGS } from '../../data/buildings';
import { Building } from '../../types/game';

interface BuildingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuildingSelect: (buildingType: string) => void;
    villageLevel: number;
}

export const BuildingModal = ({ isOpen, onClose, onBuildingSelect, villageLevel }: BuildingModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Choisir un bâtiment</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <SimpleGrid columns={2} spacing={4}>
                        {Object.entries(BUILDINGS).map(([type, building]) => {
                            const isAvailable = building.requirements.level <= villageLevel;
                            return (
                                <VStack
                                    key={type}
                                    p={4}
                                    bg={isAvailable ? "white" : "gray.100"}
                                    borderRadius="md"
                                    cursor={isAvailable ? "pointer" : "not-allowed"}
                                    onClick={() => isAvailable && onBuildingSelect(type)}
                                    _hover={isAvailable ? { bg: "gray.50" } : {}}
                                    opacity={isAvailable ? 1 : 0.6}
                                >
                                    {building.icon && <Icon as={building.icon} boxSize={6} />}
                                    <Text fontWeight="bold">{building.name}</Text>
                                    {!isAvailable && (
                                        <Text fontSize="sm" color="red.500">
                                            Niveau {building.requirements.level} requis
                                        </Text>
                                    )}
                                </VStack>
                            );
                        })}
                    </SimpleGrid>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
