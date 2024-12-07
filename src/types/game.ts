import { Timestamp } from 'firebase/firestore';
import { IconType } from 'react-icons';

export interface Resources {
    wood: number;
    iron: number;
    stone: number;
    food: number;
    [key: string]: number; // Permet l'indexation dynamique
}

export interface ProductionRates extends Resources {}

export interface Building {
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    production?: Partial<Resources>;
    storage?: Partial<Resources>;
    cost: Partial<Resources>;
    buildTime: number;
    requirements: {
        level: number;
    };
    icon: IconType;
}

export interface BuildingInstance {
    id: string;
    level: number;
    constructionStartTime?: Timestamp;
    constructionEndTime?: Timestamp;
    speedUpCount?: number; // Nombre de fois que la construction a été accélérée
}

export interface Village {
    id: string;
    name: string;
    description: string;
    bonus: string;
    image?: string;
}

export type VillageType = 'roman' | 'gaulois' | 'teuton';

export interface UserVillage {
    id: string;
    userId: string;
    name: string;
    type: VillageType;
    level: number;
    bonus: string;
    resources: Resources;
    buildings: { [position: number]: BuildingInstance };
    lastResourceUpdate?: Timestamp;
    speedUpPoints?: number; // Points d'accélération disponibles
    bonuses?: {
        [key in keyof Resources]?: number;
    };
    createdAt?: Timestamp;
}
