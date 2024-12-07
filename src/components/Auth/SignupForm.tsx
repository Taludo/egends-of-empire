import { useState } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    FormErrorMessage,
} from '@chakra-ui/react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '../../contexts/ToastContext';

interface SignupFormProps {
    onSuccess: () => void;
}

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Compte créé avec succès',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onSuccess();
        } catch (error: any) {
            let errorMessage = 'Une erreur est survenue lors de l\'inscription';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Cet email est déjà utilisé';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email invalide';
            }

            setError(errorMessage);
            toast({
                title: 'Erreur d\'inscription',
                description: errorMessage,
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
                </FormControl>

                <FormControl isInvalid={!!error}>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    S'inscrire
                </Button>
            </VStack>
        </form>
    );
};
