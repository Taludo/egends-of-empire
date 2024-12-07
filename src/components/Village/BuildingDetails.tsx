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