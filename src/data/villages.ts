import { Village } from '../types/game';

export const availableVillages: Village[] = [
    {
        id: 'roman',
        name: 'Village Romain',
        description: 'Les Romains sont connus pour leur architecture avancée et leur organisation militaire.',
        bonus: '+20% production de pierre',
        image: '/images/roman-village.jpg'
    },
    {
        id: 'gaulois',
        name: 'Village Gaulois',
        description: 'Les Gaulois sont des experts en agriculture et en production de nourriture.',
        bonus: '+20% production de nourriture',
        image: '/images/gaul-village.jpg'
    },
    {
        id: 'teuton',
        name: 'Village Teuton',
        description: 'Les Teutons excellent dans la production de bois et la formation d\'unités.',
        bonus: '+20% production de bois',
        image: '/images/teuton-village.jpg'
    }
];
