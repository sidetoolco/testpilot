import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TestData } from '../types';

interface TestStateFromLocation {
  testData?: TestData;
  testId?: string;
  isIncompleteTest?: boolean;
  currentStep?: string;
}

export const useTestStateFromLocation = () => {
  const location = useLocation();
  const state = location.state as TestStateFromLocation;

  return {
    testData: state?.testData,
    testId: state?.testId,
    isIncompleteTest: state?.isIncompleteTest || false,
    currentStep: state?.currentStep,
  };
};

export const initializeTestFromState = (
  state: TestStateFromLocation,
  setTestData: (data: TestData) => void,
  setCurrentTestId?: (id: string) => void
) => {
  if (state.isIncompleteTest && state.testData) {
    // Cargar datos del test incompleto
    setTestData(state.testData);

    if (state.testId && setCurrentTestId) {
      setCurrentTestId(state.testId);
    }

    console.log('Test incompleto cargado:', {
      testId: state.testId,
      currentStep: state.currentStep,
      testData: state.testData,
    });
  }
};

// Ejemplo de uso en un componente de creación de test:
/*
const CreateTestComponent = () => {
  const [testData, setTestData] = useState<TestData>(initialTestData);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const testState = useTestStateFromLocation();

  useEffect(() => {
    initializeTestFromState(testState, setTestData, setCurrentTestId);
  }, [testState]);

  // ... resto del componente
};
*/
