/**
 * Migration utility to fix existing users for the friend system
 *
 * This creates parent user documents for users who only have subcollections.
 * Run this once from the browser console by calling: window.migrateFriendSystem()
 */

import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export async function migrateFriendSystem() {
  const user = auth.currentUser;

  if (!user) {
    console.error('Must be signed in to run migration');
    return;
  }

  console.log('Starting friend system migration...');
  console.log('Current user:', user.uid);

  try {
    // Check if current user's parent document exists
    const userDocRef = doc(db, 'users', user.uid);

    // Create parent document if it doesn't exist
    console.log('Creating/updating parent document for current user...');
    await setDoc(userDocRef, {
      createdAt: serverTimestamp(),
    }, { merge: true }); // merge: true prevents overwriting existing data

    console.log('✓ Parent document created/updated');

    // Try to list all users (this will help debug permissions)
    console.log('Attempting to list all users in database...');
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);

    console.log(`Found ${usersSnap.size} user documents`);

    usersSnap.forEach((doc) => {
      console.log(`- User ID: ${doc.id}`);
    });

    // Try to read profiles
    console.log('\nChecking profiles...');
    for (const userDoc of usersSnap.docs) {
      const profileSnap = await getDocs(collection(db, 'users', userDoc.id, 'profile'));
      console.log(`User ${userDoc.id} has ${profileSnap.size} profile documents`);

      profileSnap.forEach((profile) => {
        console.log(`  - ${profile.id}:`, profile.data());
      });
    }

    console.log('\n✓ Migration complete!');
    console.log('You can now try adding friends.');

  } catch (error) {
    console.error('Migration failed:', error);

    // Check if it's a permissions error
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('\n⚠️ PERMISSION DENIED ERROR');
      console.error('Make sure you have deployed the updated Firestore rules!');
    }
  }
}

// Make it available globally for easy access from console
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).migrateFriendSystem = migrateFriendSystem;
  console.log('Migration utility loaded. Run window.migrateFriendSystem() to migrate your account.');
}
