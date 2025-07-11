import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { TestData } from '../types';

interface TestCreationState {
  testData: TestData | null;
  currentStep: string | null;
  currentTestId: string | null;
  isInProgress: boolean;
}

interface TestCreationContextType {
  state: TestCreationState;
  setTestData: (testData: TestData) => void;
  setCurrentStep: (step: string) => void;
  setCurrentTestId: (id: string | null) => void;
  setIsInProgress: (inProgress: boolean) => void;
  setSaveIncompleteTest: (saveFunction: () => Promise<void>) => void;
  saveIncompleteTest: () => Promise<void>;
  clearState: () => void;
}

const TestCreationContext = createContext<TestCreationContextType | undefined>(undefined);

interface TestCreationProviderProps {
  children: ReactNode;
}

export const TestCreationProvider: React.FC<TestCreationProviderProps> = ({ children }) => {
  const [state, setState] = useState<TestCreationState>({
    testData: null,
    currentStep: null,
    currentTestId: null,
    isInProgress: false,
  });

  const [saveIncompleteTestFunction, setSaveIncompleteTestFunction] = useState<
    (() => Promise<void>) | null
  >(null);

  const setTestData = useCallback((testData: TestData) => {
    setState(prev => ({ ...prev, testData }));
  }, []);

  const setCurrentStep = useCallback((step: string) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const setCurrentTestId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, currentTestId: id }));
  }, []);

  const setIsInProgress = useCallback((inProgress: boolean) => {
    setState(prev => ({ ...prev, isInProgress: inProgress }));
  }, []);

  const setSaveIncompleteTest = useCallback((saveFunction: () => Promise<void>) => {
    setSaveIncompleteTestFunction(() => saveFunction);
  }, []);

  const saveIncompleteTest = useCallback(async () => {
    if (saveIncompleteTestFunction) {
      return saveIncompleteTestFunction();
    }
    throw new Error('saveIncompleteTest function not set');
  }, [saveIncompleteTestFunction]);

  const clearState = useCallback(() => {
    setState({
      testData: null,
      currentStep: null,
      currentTestId: null,
      isInProgress: false,
    });
    setSaveIncompleteTestFunction(null);
  }, []);

  const value = useMemo<TestCreationContextType>(() => ({
    state,
    setTestData,
    setCurrentStep,
    setCurrentTestId,
    setIsInProgress,
    setSaveIncompleteTest,
    saveIncompleteTest,
    clearState,
  }), [
    state,
    setTestData,
    setCurrentStep,
    setCurrentTestId,
    setIsInProgress,
    setSaveIncompleteTest,
    saveIncompleteTest,
    clearState,
  ]);

  return <TestCreationContext.Provider value={value}>{children}</TestCreationContext.Provider>;
};

export const useTestCreation = () => {
  const context = useContext(TestCreationContext);
  if (context === undefined) {
    throw new Error('useTestCreation must be used within a TestCreationProvider');
  }
  return context;
};

// Hook for components that only need to read the state
export const useTestCreationState = () => {
  const context = useContext(TestCreationContext);
  if (context === undefined) {
    return null;
  }
  return context.state;
};
