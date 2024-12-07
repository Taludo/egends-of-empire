import { useState } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    FormErrorMessage,
} from '@chakra-ui/react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '../../contexts/ToastContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
    onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();
    const navigate = useNavigate();

    const checkForExistingVillage = async (userId: string) => {
        const villagesRef = collection(db, 'villages');
        const q = query(villagesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const hasVillage = await checkForExistingVillage(userCredential.user.uid);
            
            toast({
                title: 'Connexion réussie',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Appeler onSuccess avant la navigation
            onSuccess();

            // Rediriger si l'utilisateur a un village
            if (hasVillage) {
                navigate('/village');
            }
        } catch (error: any) {
            setError(
                error.code === 'auth/invalid-credential'
                    ? 'Email ou mot de passe incorrect'
                    : 'Une erreur est survenue lors de la connexion'
            );
            toast({
                title: 'Erreur de connexion',
                description: error.code === 'auth/invalid-credential'
                    ? 'Email ou mot de passe incorrect'
                    : 'Une erreur est survenue lors de la connexion',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isInvalid={!!error}>
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </FormControl>

                <FormControl isInvalid={!!error}>
                    <FormLabel>Mot de passe</FormLabel>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <FormErrorMessage>{error}</FormErrorMessage>}
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    isLoading={isLoading}
                >
                    Se connecter
                </Button>
            </VStack>
        </form>
    );
};
