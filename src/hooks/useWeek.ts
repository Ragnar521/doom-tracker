import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatWeekStartDate, getCurrentWeekId } from '../lib/weekUtils';

export type WeekStatus = 'normal' | 'sick' | 'vacation';

export interface WeekData {
  startDate: string;
  workouts: boolean[];
  status: WeekStatus;
  updatedAt: Date | null;
}

const STORAGE_KEY = 'doom-tracker-week';

const defaultWeekData: WeekData = {
  startDate: formatWeekStartDate(getCurrentWeekId()),
  workouts: [false, false, false, false, false, false, false],
  status: 'normal',
  updatedAt: null,
};

export function useWeek(weekId: string = getCurrentWeekId()) {
  const { user } = useAuth();
  const [data, setData] = useState<WeekData>(defaultWeekData);
  const [loading, setLoading] = useState(true);

  // Load data from Firestore or localStorage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      if (user) {
        // Load from Firestore
        try {
          const docRef = doc(db, 'users', user.uid, 'weeks', weekId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            setData({
              startDate: firestoreData.startDate,
              workouts: firestoreData.workouts,
              status: firestoreData.status,
              updatedAt: firestoreData.updatedAt?.toDate() || null,
            });
          } else {
            // Create new week document
            const newData = {
              ...defaultWeekData,
              startDate: formatWeekStartDate(weekId),
            };
            setData(newData);
          }
        } catch (error) {
          console.error('Error loading week data:', error);
        }
      } else {
        // Load from localStorage (guest mode)
        const saved = localStorage.getItem(`${STORAGE_KEY}-${weekId}`);
        if (saved) {
          setData(JSON.parse(saved));
        } else {
          setData({
            ...defaultWeekData,
            startDate: formatWeekStartDate(weekId),
          });
        }
      }

      setLoading(false);
    };

    loadData();
  }, [user, weekId]);

  // Save data to Firestore or localStorage
  const saveData = useCallback(async (newData: WeekData) => {
    if (user) {
      // Save to Firestore
      try {
        const docRef = doc(db, 'users', user.uid, 'weeks', weekId);
        await setDoc(docRef, {
          ...newData,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving week data:', error);
      }
    } else {
      // Save to localStorage
      localStorage.setItem(`${STORAGE_KEY}-${weekId}`, JSON.stringify(newData));
    }
  }, [user, weekId]);

  // Toggle a day's workout status
  const toggleDay = useCallback(async (dayIndex: number) => {
    const newWorkouts = [...data.workouts];
    newWorkouts[dayIndex] = !newWorkouts[dayIndex];

    const newData: WeekData = {
      ...data,
      workouts: newWorkouts,
      updatedAt: new Date(),
    };

    setData(newData);
    await saveData(newData);
  }, [data, saveData]);

  // Set week status
  const setStatus = useCallback(async (status: WeekStatus) => {
    const newData: WeekData = {
      ...data,
      status,
      updatedAt: new Date(),
    };

    setData(newData);
    await saveData(newData);
  }, [data, saveData]);

  // Count completed workouts
  const workoutCount = data.workouts.filter(Boolean).length;

  return {
    data,
    loading,
    toggleDay,
    setStatus,
    workoutCount,
  };
}
