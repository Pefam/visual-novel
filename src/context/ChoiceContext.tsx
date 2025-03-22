"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

export type ChoiceType = {
  id: string;
  type: 'A' | 'B' | 'C';
};

interface ChoiceContextType {
  choices: ChoiceType[];
  addChoice: (choice: ChoiceType) => void;
  resetChoices: () => void;
}

const ChoiceContext = createContext<ChoiceContextType>({
  choices: [],
  addChoice: () => {},
  resetChoices: () => {}
});

export const ChoiceProvider = ({ children }: { children: ReactNode }) => {
  const [choices, setChoices] = useState<ChoiceType[]>([]);

  return (
    <ChoiceContext.Provider value={{
      choices,
      addChoice: (choice) => setChoices(prev => [...prev, choice]),
      resetChoices: () => setChoices([])
    }}>
      {children}
    </ChoiceContext.Provider>
  );
};

export const useChoices = () => useContext(ChoiceContext);