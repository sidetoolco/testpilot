import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import FakeAmazonGrid from '../components/testers-session/FakeAmazonGrid';
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';
import { useSessionStore } from '../store/useSessionStore';
import {
  checkAndFetchExistingSession,
  fetchProductAndCompetitorData,
  processString,
} from '../features/tests/services/testersSessionService';
import { createNewSession } from '../features/tests/services/testersSessionService';
import { Lightbulb } from 'lucide-react';
import { getTracker } from '../lib/openReplay';

interface TestData {
  id: string;
  searchTerm: string;
  competitors: any[];
  variations: any[];
}

const useFetchTestData = (id: string | undefined) => {
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProductAndCompetitorData(id)
        .then((data: any) => {
          setData(data);
          setLoading(false);
        })
        .catch((error: any) => {
          setError(error.message);
          setLoading(false);
        });
    }
  }, [id]);

  return { data, loading, error };
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: string;
}

const Modal = ({ isOpen, onClose, test }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg text-center relative z-60 max-w-lg mx-4 md:mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center mb-4">
          <Lightbulb className="h-10 w-10 text-[#00A67E] mb-2 md:mb-0 md:mr-2" />
          <h2 className="text-2xl md:text-3xl font-bold">Important Instructions</h2>
        </div>
        <p className="text-gray-700 text-sm md:text-base">
          Imagine you are shopping for
          <strong> "{test} </strong>. Please browse as you normally would, add your selection to
          cart, and then checkout.
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-[#00A67E] hover:bg-[#00A67E] text-white py-2 px-6 md:px-7 rounded-full font-medium"
        >
          Ok
        </button>
      </div>
    </div>
  );
};

const combineVariantsAndCompetitors = (data: any) => {
  let storedOrder = sessionStorage.getItem(`productOrder-${data.id}`);

  let competitorsWithVariations = [...data.competitors];
  data.variations.forEach((variation: any) => {
    competitorsWithVariations.push({
      product: { ...variation.product },
    });
  });

  if (storedOrder) {
    // Si ya hay un orden guardado, parsearlo y aplicar ese orden
    const orderedIndexes = JSON.parse(storedOrder);
    competitorsWithVariations = orderedIndexes.map(
      (index: number) => competitorsWithVariations[index]
    );
  } else {
    // Si no hay un orden guardado, barajar y almacenar el orden
    let shuffledIndexes = competitorsWithVariations.map((_, index) => index);
    for (let i = shuffledIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
    }

    // Reordenar la lista basada en los índices aleatorios
    competitorsWithVariations = shuffledIndexes.map(index => competitorsWithVariations[index]);
    sessionStorage.setItem(`productOrder-${data.id}`, JSON.stringify(shuffledIndexes));
  }

  return {
    ...data,
    competitors: competitorsWithVariations,
  };
};

const TestUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prolificPid = searchParams.get('PROLIFIC_PID')
    ? searchParams.get('PROLIFIC_PID')
    : '123456789';
  const { data, loading, error } = useFetchTestData(id);
  const [cartItems] = useState<any[]>([]);

  const { startSession, shopperId } = useSessionStore();
  const isModalOpen = !shopperId;

  const [sessionStarted, setSessionStarted] = useState(false);

  const combinedData = data ? combineVariantsAndCompetitors(data) : null;

  useEffect(() => {
    if (prolificPid) {
      sessionStorage.setItem('prolificPid', prolificPid);
    }
  }, [prolificPid]);

  const closeModal = async () => {
    try {
      const result = processString(id ?? '');
      const testId = result?.modifiedString ?? '';
      const variant = result?.lastCharacter ?? '';

      const existingSession: any = await checkAndFetchExistingSession(testId, variant);

      if (existingSession?.ended_at) {
        navigate('/thanks', { state: { testId: id + '-' + variant } });
        return;
      }

      if (existingSession && combinedData) {
        startSession(
          existingSession.id,
          combinedData.id,
          combinedData,
          new Date(existingSession.created_at),
          existingSession.product_id ?? existingSession.competitor_id,
          prolificPid
        );

        if (existingSession.product_id || existingSession.competitor_id) {
          navigate('/questions');
        }

        if (!shopperId) return;

        const tracker = getTracker(
          `shopperSessionID:${shopperId}-testID:${id}-prolificPID:${prolificPid}`
        );
        tracker.trackWs('SessionEvents')?.(
          'Session Resumed',
          JSON.stringify({ sessionId: existingSession.id, prolificPid }),
          'up'
        );

        return;
      }

      // Create new session
      const sessionId = await createNewSession(id ?? '', combinedData, prolificPid);
      if (sessionId && combinedData) {
        startSession(sessionId, combinedData.id, combinedData, new Date(), undefined, prolificPid);
        setSessionStarted(true);

        if (!shopperId) return;

        const tracker = getTracker(
          `shopperSessionID:${shopperId}-testID:${id}-prolificPID:${prolificPid}`
        );
        tracker.trackWs('SessionEvents')?.(
          'Session Started',
          JSON.stringify({ sessionId, prolificPid }),
          'up'
        );
      }
    } catch (error) {
      console.error(`Error en closeModal al procesar la sesión (ID: ${id}):`, error);
    }
  };

  useEffect(() => {
    if (shopperId && sessionStarted && id && !loading) {
      const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + id);
      tracker.trackWs('PageEvents')?.(
        'Page Loaded',
        JSON.stringify({ page: 'Test User Page' }),
        'down'
      );
    }
  }, [shopperId, sessionStarted, id, loading]); // Solo se invoca el tracker cuando la sesión comienza.

  const addToCart = (item: any) => {
    if (cartItems.length === 0) {
      useSessionStore.getState().selectItemAtCheckout(item);
      const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + id);
      tracker.trackWs('CartEvents')?.('Item Added', JSON.stringify({ item }), 'up');
    }
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <HeaderTesterSessionLayout>
      <div className="bg-[#EAEDED] min-h-[600px]">
        {loading ? (
          <div className="flex justify-center items-center min-h-[600px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : combinedData ? (
          <div key={combinedData.id}>
            <Modal isOpen={isModalOpen} onClose={closeModal} test={combinedData.search_term} />
            <div className="max-w-screen-2xl mx-auto px-4 py-4">
              <div className="bg-white p-4 mb-4 rounded-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#565959]">
                    {combinedData.competitors.length} results for
                  </span>
                  <span className="text-sm font-bold text-[#0F1111]">
                    "{combinedData.search_term}"
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <FakeAmazonGrid products={combinedData.competitors} addToCart={addToCart} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No data found</p>
        )}
      </div>
    </HeaderTesterSessionLayout>
  );
};

export default TestUserPage;
