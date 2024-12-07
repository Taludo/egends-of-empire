import {
    Button,
    VStack,
    HStack,
    Text,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from '@chakra-ui/react';
import { FaBolt, FaCoins } from 'react-icons/fa';
import { Resources } from '../../types/game';

interface SpeedUpCostProps {
    speedUpCount: number;
    onSpeedUp: (usePoints: boolean) => void;
    availablePoints: number;
    currentResources: Resources;
}

export const SpeedUpCost = ({
    speedUpCount,
    onSpeedUp,
    availablePoints,
    currentResources
}: SpeedUpCostProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Calcul des coûts de base
    const baseCost = {
        wood: 100,
        stone: 50,
        iron: 30
    };

    // Augmentation de 50% par utilisation
    const multiplier = Math.pow(1.5, speedUpCount);
    const currentCost = {
        wood: Math.floor(baseCost.wood * multiplier),
        stone: Math.floor(baseCost.stone * multiplier),
        iron: Math.floor(baseCost.iron * multiplier)
    };

    const canAffordResources = 
        currentResources.wood >= currentCost.wood &&
        currentResources.stone >= currentCost.stone &&
        currentResources.iron >= currentCost.iron;

    return (
        <>
            <Button
                size="sm"
                colorScheme="blue"
                onClick={onOpen}
                leftIcon={<Icon as={FaBolt} />}
            >
                Accélérer
            </Button>

            <Modal 
                isOpen={isOpen} 
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Accélérer la construction</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <Button
                                colorScheme="purple"
                                onClick={() => {
                                    onSpeedUp(true);
                                    onClose();
                                }}
                                isDisabled={availablePoints <= 0}
                                leftIcon={<Icon as={FaCoins} />}
                            >
                                Utiliser 1 point d'accélération
                                {availablePoints <= 0 && " (Indisponible)"}
                            </Button>

                            <Text fontWeight="bold">Ou accélérer avec des ressources :</Text>

                            <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                    <Text>Bois requis:</Text>
                                    <Text color={currentResources.wood >= currentCost.wood ? "green.500" : "red.500"}>
                                        {currentCost.wood}
                                    </Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Pierre requise:</Text>
                                    <Text color={currentResources.stone >= currentCost.stone ? "green.500" : "red.500"}>
                                        {currentCost.stone}
                                    </Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Fer requis:</Text>
                                    <Text color={currentResources.iron >= currentCost.iron ? "green.500" : "red.500"}>
                                        {currentCost.iron}
                                    </Text>
                                </HStack>
                            </VStack>

                            <Button
                                colorScheme="blue"
                                onClick={() => {
                                    onSpeedUp(false);
                                    onClose();
                                }}
                                isDisabled={!canAffordResources}
                            >
                                Accélérer avec des ressources
                                {!canAffordResources && " (Ressources insuffisantes)"}
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};
