import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/firebase';

export const useWorldCupData = () => {
  const [pointsTable, setPointsTable] = useState({});
  const [chances, setChances] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const worldcupRef = ref(db, 'worldcup');

    const unsubscribe = onValue(worldcupRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPointsTable(data.pointsTable || {});
        setChances(data.qualificationChances || {});
        setLastUpdated(data.lastUpdated);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { pointsTable, chances, lastUpdated, loading };
};