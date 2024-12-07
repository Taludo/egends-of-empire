import { useEffect, useState } from 'react';
import {
    Progress,
    Text,
    VStack,
    HStack,
    Icon,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
} from '@chakra-ui/react';
import { FaClock, FaHammer } from 'react-icons/fa';
import { BuildingInstance, Resources, Building } from '../../types/game';
import { BUILDINGS } from '../../data/buildings';
import { SpeedUpCost } from './SpeedUpCost';

interface BuildingProgressProps {
    building: BuildingInstance;
    onConstructionComplete: () => void;
    onSpeedUp: (usePoints: boolean) => void;
    availablePoints: number;
    currentResources: Resources;
}

interface SpeedUpCostProps {
    speedUpCount: number;
    onSpeedUp: (usePoints: boolean) => void;
    availablePoints: number;
    currentResources: Resources;
    onOpenSpeedUp: () => void;
}

export const BuildingProgress = ({ 
    building, 
    onConstructionComplete, 
    onSpeedUp,
    availablePoints,
    currentResources
}: BuildingProgressProps) => {
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');
    const [isSpeedUpOpen, setIsSpeedUpOpen] = useState(false);
    const toast = useToast();
    const buildingInfo = BUILDINGS[building.type] as Building;

    useEffect(() => {
        const calculateProgress = () => {
            if (!building.constructionStartTime) {
                setProgress(100);
                setTimeLeft('Terminé');
                return true;
            }

            const now = Date.now();
            const start = building.constructionStartTime;
            const total = buildingInfo.buildTime * 1000; // Convertir en millisecondes
            const elapsed = now - start;
            const newProgress = Math.min(100, (elapsed / total) * 100);

            // Calculer le temps restant
            const remainingMs = Math.max(0, total - elapsed);
            const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
            const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

            setProgress(newProgress);
            setTimeLeft(`${remainingMinutes}m ${remainingSeconds}s`);

            // Si la construction est terminée
            if (newProgress >= 100) {
                onConstructionComplete();
                toast({
                    title: "Construction terminée !",
                    description: `Le ${buildingInfo.name} est terminé !`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                return true;
            }
            return false;
        };

        // Calculer immédiatement
        const isComplete = calculateProgress();
        if (isComplete) return;

        // Mettre à jour toutes les secondes
        const interval = setInterval(() => {
            const isComplete = calculateProgress();
            if (isComplete) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [building, onConstructionComplete, toast, buildingInfo]);

    const onSpeedUpClose = () => {
        setIsSpeedUpOpen(false);
    };

    return (
        <VStack spacing={2} align="stretch" w="100%" bg="white" p={4} borderRadius="md" shadow="sm">
            <HStack justify="space-between">
                <HStack>
                    <Icon as={FaHammer} />
                    <Text fontWeight="bold">{buildingInfo.name}</Text>
                </HStack>
                <HStack spacing={4}>
                    <HStack>
                        <Icon as={FaClock} />
                        <Text>{timeLeft}</Text>
                    </HStack>
                    <SpeedUpCost
                        speedUpCount={building.speedUpCount || 0}
                        onSpeedUp={onSpeedUp}
                        availablePoints={availablePoints}
                        currentResources={currentResources}
                        onOpenSpeedUp={() => setIsSpeedUpOpen(true)}
                    />
                </HStack>
            </HStack>
            <Progress
                value={progress}
                size="sm"
                colorScheme="blue"
                hasStripe
                isAnimated={progress < 100}
            />
            <Modal 
                isOpen={isSpeedUpOpen} 
                onClose={onSpeedUpClose}
            >
                <ModalOverlay />
                <ModalContent>
                    {/* Contenu du modal */}
                </ModalContent>
            </Modal>
        </VStack>
    );
};
