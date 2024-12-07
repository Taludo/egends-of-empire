import { IconType } from 'react-icons';

export interface Resources {
    wood: number;
    stone: number;
    iron: number;
    food: number;
    [key: string]: number;
}

export interface Building {
    id?: string;
    name: string;
    type: string;
    level: number;
    maxLevel: number;
    requirements: {
        level: number;
    };
    cost: Partial<Resources>;
    buildTime: number;
    production?: Partial<Resources>;
    icon?: IconType;
    description?: string;
}

export interface BuildingInstance {
    id: string;
    type: string;
    level: number;
    constructionStartTime?: number;
    speedUpCount?: number;
}

export interface UserVillage {
    id: string;
    userId: string;
    name: string;
    level: number;
    resources: Resources;
    buildings: { [position: number]: BuildingInstance };
    lastResourceUpdate?: number;
    speedUpPoints?: number;
}