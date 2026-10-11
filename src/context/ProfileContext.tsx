import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CreatorProfile {
  creatorName: string;
  kraPin: string;
  nationalId: string;
  email: string;
  businessName: string;
}

interface ProfileContextType {
  profile: CreatorProfile;
  updateProfile: (updates: Partial<CreatorProfile>) => void;
  isProfileConfigured: boolean;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'kenyan_creator_profile_v1';

const DEFAULT_PROFILE: CreatorProfile = {
  creatorName: '',
  kraPin: '',
  nationalId: '',
  email: '',
  businessName: ''
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CreatorProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear any old placeholder names if saved in previous session
        if (parsed.creatorName === 'Maina Kamau') parsed.creatorName = '';
        if (parsed.kraPin === 'P051829471Z') parsed.kraPin = '';
        if (parsed.nationalId === '29384722') parsed.nationalId = '';
        return { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch (e) {
      console.warn('Error reading creator profile from storage', e);
    }
    return DEFAULT_PROFILE;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving creator profile to storage', e);
    }
  }, [profile]);

  const updateProfile = (updates: Partial<CreatorProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const isProfileConfigured = Boolean(profile.creatorName.trim() || profile.kraPin.trim());

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        isProfileConfigured,
        isEditModalOpen,
        setIsEditModalOpen
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
