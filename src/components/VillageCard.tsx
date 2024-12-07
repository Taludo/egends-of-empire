import { Box, Heading, Text, VStack, Image, Button } from '@chakra-ui/react';
import { Village } from '../types/game';

interface VillageCardProps {
    village: Village;
    onSelect: (village: Village) => void;
}

export const VillageCard = ({ village, onSelect }: VillageCardProps) => {
    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            p={6}
            shadow="md"
            width="full"
            maxW="400px"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.02)' }}
        >
            <VStack align="start" spacing={4}>
                <Heading size="md">{village.name}</Heading>
                
                {village.image && (
                    <Box width="full" height="200px" position="relative" overflow="hidden" borderRadius="md">
                        <Image
                            src={village.image}
                            alt={village.name}
                            objectFit="cover"
                            width="100%"
                            height="100%"
                            fallbackSrc="https://via.placeholder.com/400x200?text=Village+Image"
                        />
                    </Box>
                )}

                <Text>{village.description}</Text>
                
                <Text color="green.500" fontWeight="bold">
                    Bonus spécial: {village.bonus}
                </Text>

                <Button
                    colorScheme="blue"
                    width="full"
                    onClick={() => onSelect(village)}
                    size="lg"
                    mt={2}
                >
                    Choisir ce village
                </Button>
            </VStack>
        </Box>
    );
};
