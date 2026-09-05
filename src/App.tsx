import { useState, useEffect } from 'react';
import type { StudentProfile } from './types';
import { LoginScreen } from './components/LoginScreen';
import { GameCanvas } from './components/GameCanvas';
import { saveStudentProfile, subscribeStudentProfile } from './lib/firebase';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Subscribe to real-time updates from Firestore for this student profile
  useEffect(() => {
    if (!profile?.manageCode) return;

    const unsubscribe = subscribeStudentProfile(profile.manageCode, (updated) => {
      setProfile((prev) => {
        if (!prev) return updated;
        // Merge to avoid race conditions
        return {
          ...prev,
          ...updated,
        };
      });
    });

    return () => unsubscribe();
  }, [profile?.manageCode]);

  const handleStartGame = async (selectedProfile: StudentProfile) => {
    // Save to Firestore and local storage
    await saveStudentProfile(selectedProfile);
    setProfile(selectedProfile);
  };

  const handleUpdateProfile = async (updated: StudentProfile) => {
    setProfile(updated);
    await saveStudentProfile(updated);
  };

  const handleHome = () => {
    setProfile(null);
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center font-sans antialiased text-white">
      {!profile ? (
        <LoginScreen onStartGame={handleStartGame} />
      ) : (
        <GameCanvas
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onHome={handleHome}
        />
      )}
    </main>
  );
}
