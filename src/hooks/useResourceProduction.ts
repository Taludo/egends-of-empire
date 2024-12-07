import { useEffect, useRef } from 'react';
import { Resources, UserVillage } from '../types/game';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PRODUCTION_INTERVAL = 60000; // 1 minute

const BASE_PRODUCTION_RATES: Resources = {
    wood: 2,
    iron: 1,
    stone: 1,
    food: 2,
};

export const useResourceProduction = (
    village: UserVillage | null,
    onUpdate: (village: UserVillage) => void
) => {
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!village) return;

        const produceResources = async () => {
            const newResources: Resources = {
                wood: village.resources.wood + BASE_PRODUCTION_RATES.wood,
                iron: village.resources.iron + BASE_PRODUCTION_RATES.iron,
                stone: village.resources.stone + BASE_PRODUCTION_RATES.stone,
                food: village.resources.food + BASE_PRODUCTION_RATES.food,
            };

            const updatedVillage = {
                ...village,
                resources: newResources,
                lastUpdated: new Date(),
            };

            try {
                await updateDoc(doc(db, 'villages', village.userId), updatedVillage);
                onUpdate(updatedVillage);
            } catch (error) {
                console.error('Error updating resources:', error);
            }
        };

        intervalRef.current = setInterval(produceResources, PRODUCTION_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [village, onUpdate]);
};
