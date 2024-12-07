import {
    VStack,
    HStack,
    Text,
    Button,
    Progress,
    Icon,
    Divider,
    Box,
    Tooltip,
    Badge,
} from '@chakra-ui/react';
import { FaClock, FaHammer, FaBolt, FaArrowUp, FaTrash } from 'react-icons/fa';
import { BuildingInstance, Resources } from '../../types/game';
import { BUILDINGS } from '../../data/buildings';
import { SpeedUpCost } from './SpeedUpCost';
import { useEffect, useState } from 'react';

interface BuildingDetailsProps {
    building: BuildingInstance;
    position: number;
    onConstructionComplete: (position: number) => void;
    onSpeedUpConstruction: (building: BuildingInstance, position: number, usePoints: boolean) => void;
    speedUpPoints: number;
    resources: Resources;
}

export const BuildingDetails = ({
    building,
    position,
    onConstructionComplete,
    onSpeedUpConstruction,
    speedUpPoints,
    resources,
}: BuildingDetailsProps) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const buildingInfo = BUILDINGS[building.type];

    useEffect(() => {
        const updateProgress = () => {
            if (!building.constructionStartTime || !building.constructionEndTime) return;

            const now = new Date().getTime();
            const start = building.constructionStartTime.getTime();
            const end = building.constructionEndTime.getTime();
            const total = end - start;
            const elapsed = now - start;
            const remaining = end - now;

            if (remaining <= 0) {
                onConstructionComplete(position);
                return;
            }

            setTimeLeft(Math.max(0, Math.floor(remaining / 1000)));
            setProgress(Math.min(100, (elapsed / total) * 100));
        };

        updateProgress();
        const interval = setInterval(updateProgress, 1000);
        return () => clearInterval(interval);
    }, [building, position, onConstructionComplete]);

    const formatTime = (seconds: number): string => {
        if (seconds <= 0) return '0s';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
        
        return parts.join(' ');
    };

    const getProductionInfo = () => {
        if (!buildingInfo.production) return null;
        
        return (
            <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Production par heure :</Text>
                {Object.entries(buildingInfo.production).map(([resource, amount]) => (
                    <HStack key={resource} spacing={2}>
                        <Icon as={FaHammer} />
                        <Text>{`${amount} ${resource}`}</Text>
                    </HStack>
                ))}
            </VStack>
        );
    };

    const isUnderConstruction = building.constructionStartTime && building.constructionEndTime;

    return (
        <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            shadow="sm"
        >
            <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                        <Text fontSize="xl" fontWeight="bold">
                            {buildingInfo.name}
                            <Badge ml={2} colorScheme="blue">Niveau {building.level}</Badge>
                        </Text>
                        <Text color="gray.600">{buildingInfo.description}</Text>
                    </VStack>
                </HStack>

                <Divider />

                {isUnderConstruction ? (
                    <VStack spacing={3} align="stretch">
                        <Text fontWeight="bold">Construction en cours</Text>
                        <Progress
                            value={progress}
                            size="sm"
                            colorScheme="blue"
                            borderRadius="full"
                        />
                        <HStack>
                            <Icon as={FaClock} />
                            <Text>{formatTime(timeLeft)} restant</Text>
                        </HStack>
                        <SpeedUpCost
                            speedUpCount={building.speedUpCount || 0}
                            onSpeedUp={(usePoints) => onSpeedUpConstruction(building, position, usePoints)}
                            availablePoints={speedUpPoints}
                            currentResources={resources}
                            onOpenSpeedUp={() => {}}
                        />
                    </VStack>
                ) : (
                    <>
                        {getProductionInfo()}
                        <VStack align="start" spacing={2} mt={2}>
                            <Text fontWeight="bold">Prochain niveau :</Text>
                            <HStack spacing={4}>
                                <Tooltip label="Améliorer le bâtiment">
                                    <Button
                                        leftIcon={<Icon as={FaArrowUp} />}
                                        colorScheme="green"
                                        size="sm"
                                    >
                                        Améliorer
                                    </Button>
                                </Tooltip>
                                <Tooltip label="Détruire le bâtiment">
                                    <Button
                                        leftIcon={<Icon as={FaTrash} />}
                                        colorScheme="red"
                                        variant="outline"
                                        size="sm"
                                    >
                                        Détruire
                                    </Button>
                                </Tooltip>
                            </HStack>
                        </VStack>
                    </>
                )}
            </VStack>
        </Box>
    );
};