import { Building } from '../types/game';

export const BUILDINGS: Record<string, Building> = {
    woodcutter: {
        id: 'woodcutter',
        name: 'Bûcheron',
        description: 'Produit du bois',
        level: 1,
        maxLevel: 10,
        production: {
            wood: 10,
        },
        cost: {
            wood: 50,
            stone: 30,
        },
        buildTime: 300, // 5 minutes
        requirements: {
            level: 1,
        }
    },
    ironMine: {
        id: 'ironMine',
        name: 'Mine de fer',
        description: 'Produit du fer',
        level: 1,
        maxLevel: 10,
        production: {
            iron: 8,
        },
        cost: {
            wood: 60,
            stone: 50,
        },
        buildTime: 360,
        requirements: {
            level: 2,
        }
    },
    quarry: {
        id: 'quarry',
        name: 'Carrière',
        description: 'Produit de la pierre',
        level: 1,
        maxLevel: 10,
        production: {
            stone: 8,
        },
        cost: {
            wood: 50,
            iron: 20,
        },
        buildTime: 300,
        requirements: {
            level: 1,
        }
    },
    farm: {
        id: 'farm',
        name: 'Ferme',
        description: 'Produit de la nourriture',
        level: 1,
        maxLevel: 10,
        production: {
            food: 10,
        },
        cost: {
            wood: 40,
            stone: 30,
        },
        buildTime: 240,
        requirements: {
            level: 1,
        }
    },
    warehouse: {
        id: 'warehouse',
        name: 'Entrepôt',
        description: 'Augmente la capacité de stockage',
        level: 1,
        maxLevel: 10,
        storage: {
            wood: 1000,
            iron: 1000,
            stone: 1000,
            food: 1000,
        },
        cost: {
            wood: 100,
            stone: 100,
            iron: 50,
        },
        buildTime: 600,
        requirements: {
            level: 1,
        }
    },
    townHall: {
        id: 'townHall',
        name: 'Hôtel de ville',
        description: 'Centre de votre village',
        level: 1,
        maxLevel: 10,
        cost: {
            wood: 200,
            stone: 200,
            iron: 100,
        },
        buildTime: 900,
        requirements: {
            level: 1,
        }
    },
};
