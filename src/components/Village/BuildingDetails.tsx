import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    HStack,
    Text,
    Icon,
    Button,
    Divider,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { BuildingInstance } from '../../types/game';
import { BUILDINGS } from '../../data/buildings';
import { FaArrowUp, FaTrash } from 'react-icons/fa';
import { useRef } from 'react';

interface BuildingDetailsProps {
    building: BuildingInstance;
    position: number;
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
    onDestroy: (position: number) => void;
}

export const BuildingDetails = ({ 
    building, 
    position,
    isOpen, 
    onClose, 
    onUpgrade,
    onDestroy 
}: BuildingDetailsProps) => {
    const buildingInfo = BUILDINGS[building.id];
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const handleDestroy = () => {
        onDestroy(position);
        onAlertClose();
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack>
                            <Icon as={buildingInfo.icon} boxSize={6} />
                            <Text>{buildingInfo.name}</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                                <Text fontWeight="bold">Niveau actuel :</Text>
                                <Text>{building.level}</Text>
                            </HStack>

                            <VStack align="stretch" spacing={2}>
                                <Text fontWeight="bold">Production :</Text>
                                {buildingInfo.production && Object.entries(buildingInfo.production).map(([resource, amount]) => (
                                    <HStack key={resource} justify="space-between">
                                        <Text>{resource} :</Text>
                                        <Text>{amount * building.level} / heure</Text>
                                    </HStack>
                                ))}
                            </VStack>

                            <Divider />

                            <VStack align="stretch" spacing={2}>
                                <Text fontWeight="bold">Prochain niveau :</Text>
                                <HStack justify="space-between">
                                    <Text>Niveau {building.level + 1}</Text>
                                    {buildingInfo.production && (
                                        <Text color="green.500">
                                            +{Object.values(buildingInfo.production)[0]} / heure
                                        </Text>
                                    )}
                                </HStack>
                            </VStack>

                            <Button
                                leftIcon={<Icon as={FaArrowUp} />}
                                colorScheme="blue"
                                onClick={onUpgrade}
                                isDisabled={!onUpgrade}
                            >
                                Améliorer au niveau {building.level + 1}
                            </Button>

                            <Divider />

                            <Button
                                leftIcon={<Icon as={FaTrash} />}
                                colorScheme="red"
                                variant="outline"
                                onClick={onAlertOpen}
                            >
                                Détruire le bâtiment
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onAlertClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Détruire le bâtiment
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Êtes-vous sûr de vouloir détruire ce {buildingInfo.name} niveau {building.level} ?
                            Cette action est irréversible.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                Annuler
                            </Button>
                            <Button colorScheme="red" onClick={handleDestroy} ml={3}>
                                Détruire
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};
