import {
    HStack,
    Text,
    Icon,
    Tooltip,
    Badge,
} from '@chakra-ui/react';
import { FaBolt } from 'react-icons/fa';

interface SpeedUpPointsProps {
    points: number;
}

export const SpeedUpPoints = ({ points }: SpeedUpPointsProps) => {
    return (
        <Tooltip label="Points d'accélération disponibles pour terminer instantanément une construction">
            <HStack
                spacing={2}
                bg="yellow.100"
                p={2}
                borderRadius="md"
                border="1px"
                borderColor="yellow.300"
            >
                <Icon as={FaBolt} color="yellow.500" />
                <Text fontWeight="bold" color="yellow.700">Points :</Text>
                <Badge colorScheme={points > 0 ? "green" : "red"} fontSize="md">
                    {points}
                </Badge>
            </HStack>
        </Tooltip>
    );
};
