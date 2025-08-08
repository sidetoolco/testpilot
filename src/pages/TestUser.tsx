import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import FakeAmazonGrid from '../components/testers-session/FakeAmazonGrid';
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';
import { useSessionStore } from '../store/useSessionStore';
import { useTestCompletionStore } from '../store/useTestCompletionStore';
import {
  checkAndFetchExistingSession,
  fetchProductAndCompetitorData,
  processString,
} from '../features/tests/services/testersSessionService';
import { createNewSession } from '../features/tests/services/testersSessionService';
import { checkTestCompletion } from '../features/tests/services/testCompletionService';
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
  onCaptchaVerify: (token: string | null) => void;
  captchaVerified: boolean;
  captchaLoading: boolean;
}

const Modal = ({ isOpen, onClose, test, onCaptchaVerify, captchaVerified, captchaLoading }: ModalProps) => {
  const [recaptchaRef, setRecaptchaRef] = useState<any>(null);

  if (!isOpen) return null;

  const handleButtonClick = () => {
    if (!captchaVerified && !captchaLoading) {
      // Trigger the invisible captcha
      if (recaptchaRef) {
        recaptchaRef.execute();
      }
    } else {
      onClose();
    }
  };

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
        
        {/* reCAPTCHA - Hidden for invisible */}
        <div className="hidden">
          {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
            <ReCAPTCHA
              ref={(ref) => setRecaptchaRef(ref)}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={onCaptchaVerify}
              size="invisible"
            />
          ) : (
            <div className="text-red-500">
              reCAPTCHA site key not found. Please check your environment variables.
            </div>
          )}
        </div>
        
        <button
          onClick={handleButtonClick}
          disabled={captchaLoading}
          className={`mt-4 py-2 px-6 md:px-7 rounded-full font-medium ${
            !captchaLoading
              ? 'bg-[#00A67E] hover:bg-[#00A67E] text-white'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {captchaLoading ? 'Verifying...' : 'Ok'}
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
  const { isTestCompleted, markTestCompleted } = useTestCompletionStore();
  const isModalOpen = !shopperId;

  const [sessionStarted, setSessionStarted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const combinedData = data ? combineVariantsAndCompetitors(data) : null;

  useEffect(() => {
    if (prolificPid) {
      sessionStorage.setItem('prolificPid', prolificPid);
    }
  }, [prolificPid]);

  const handleCaptchaVerify = async (token: string | null) => {
    if (!token) {
      console.log('No captcha token received');
      return;
    }

    setCaptchaLoading(true);
    try {
      console.log('Captcha token received:', token);
      
      // For v2 invisible, we can proceed immediately if we get a token
      // In production, you should verify this token on your backend
      setCaptchaVerified(true);
      setCaptchaLoading(false);
      
      // Proceed with test logic after captcha verification
      await proceedWithTest();
    } catch (error) {
      console.error('Captcha verification failed:', error);
      alert('Captcha verification failed. Please try again.');
      setCaptchaLoading(false);
    }
  };

  const proceedWithTest = async () => {
    try {
      const result = processString(id ?? '');
      const testId = result?.modifiedString ?? '';
      const variant = result?.lastCharacter ?? '';

      // Check localStorage first (fast)
      if (isTestCompleted(testId, variant)) {
        navigate('/thanks', { state: { testId: id + '-' + variant } });
        return;
      }

      // Check server-side completion status
      const completionStatus = await checkTestCompletion(testId, variant, prolificPid);
      if (completionStatus.isCompleted) {
        // Mark in localStorage for future fast checks
        markTestCompleted(testId, variant);
        navigate('/thanks', { state: { testId: id + '-' + variant } });
        return;
      }

      const existingSession: any = await checkAndFetchExistingSession(testId, variant);

      if (existingSession?.ended_at) {
        markTestCompleted(testId, variant);
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
      console.error(`Error en proceedWithTest al procesar la sesión (ID: ${id}):`, error);
    }
  };

  const closeModal = async () => {
    // Only proceed if captcha is verified
    if (!captchaVerified) {
      return;
    }
    
    await proceedWithTest();
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
            <Modal 
              isOpen={isModalOpen} 
              onClose={closeModal} 
              test={combinedData.search_term}
              onCaptchaVerify={handleCaptchaVerify}
              captchaVerified={captchaVerified}
              captchaLoading={captchaLoading}
            />
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
                  <FakeAmazonGrid
                    products={combinedData.competitors}
                    addToCart={addToCart}
                    variantType={id ? id[id.length - 1] : ''}
                    testId={id ? id.slice(0, -2) : ''}
                  />
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
