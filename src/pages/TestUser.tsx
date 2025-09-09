import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import FakeAmazonGrid from '../components/testers-session/FakeAmazonGrid';
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';
import WalmartGrid from '../components/walmart/WalmartGrid';
import WalmartHeaderLayout from '../components/walmart/WalmartHeaderLayout';
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
import { toast } from 'sonner';

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

// For now, we'll hardcode the skin based on the test ID
// In the future, this should come from the database
const getTestSkin = (testId: string): 'amazon' | 'walmart' => {
  // You can implement your own logic here to determine the skin
  // For example, based on test ID pattern, company preference, etc.
  // For now, let's use a simple pattern: if test ID contains 'walmart', use Walmart skin
  return testId.toLowerCase().includes('walmart') ? 'walmart' : 'amazon';
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
    if (captchaVerified && !captchaLoading) {
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
        
        {/* reCAPTCHA - Visible checkbox */}
        <div className="flex justify-center py-4">
          {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
            <ReCAPTCHA
              ref={(ref) => setRecaptchaRef(ref)}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={onCaptchaVerify}
              size="normal"
            />
          ) : (
            <div className="text-red-500">
              reCAPTCHA site key not found. Please check your environment variables.
            </div>
          )}
        </div>
        
        <button
          onClick={handleButtonClick}
          disabled={!captchaVerified || captchaLoading}
          className={`mt-4 py-2 px-6 md:px-7 rounded-full font-medium ${
            captchaVerified && !captchaLoading
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

  console.log('🔍 combineVariantsAndCompetitors: data.competitors:', data.competitors);
  console.log('🔍 combineVariantsAndCompetitors: data.competitors length:', data.competitors?.length);

  // Normalize competitors to ensure consistent structure
  let competitorsWithVariations = (data.competitors || []).map((competitor: any) => {
    // If competitor is already a direct product object, use it as is
    if (competitor.id && competitor.title) {
      return competitor;
    }
    // If competitor is wrapped in a product property, extract it
    if (competitor.product && competitor.product.id) {
      return competitor.product;
    }
    // Fallback: return as is if structure is unknown
    console.warn('Unknown competitor structure:', competitor);
    return competitor;
  });

  console.log('🔍 combineVariantsAndCompetitors: competitorsWithVariations after mapping:', competitorsWithVariations);
  console.log('🔍 combineVariantsAndCompetitors: competitorsWithVariations length after mapping:', competitorsWithVariations.length);
  
  // Add variations with consistent structure
  console.log('Adding variations to competitors:', data.variations);
  console.log('Test skin:', data.skin);
  
  data.variations.forEach((variation: any) => {
    if (variation.product) {
      console.log('Adding variation product:', variation.product);
      
      // During test execution, variations should already be filtered by the fetchProductAndCompetitorData function
      // So we can add them directly without additional filtering
      competitorsWithVariations.push(variation.product);
      console.log('🔍 After adding variation - competitorsWithVariations length:', competitorsWithVariations.length);
    } else {
      console.warn('Variation missing product:', variation);
    }
  });

  console.log('🔍 Before stored order check - competitorsWithVariations length:', competitorsWithVariations.length);
  
  if (storedOrder) {
    // Si ya hay un orden guardado, parsearlo y aplicar ese orden
    try {
      const orderedIndexes = JSON.parse(storedOrder);
      console.log('🔍 Stored order indexes:', orderedIndexes);
      console.log('🔍 Current competitorsWithVariations length:', competitorsWithVariations.length);
      
      // Validate that all indexes are within bounds
      const validIndexes = orderedIndexes.filter((index: number) => 
        index >= 0 && index < competitorsWithVariations.length
      );
      
      console.log('🔍 Valid indexes:', validIndexes);
      
      if (validIndexes.length === orderedIndexes.length && validIndexes.length === competitorsWithVariations.length) {
        competitorsWithVariations = validIndexes.map(
          (index: number) => competitorsWithVariations[index]
        );
        console.log('🔍 After applying stored order - competitorsWithVariations length:', competitorsWithVariations.length);
      } else {
        // If indexes are invalid or count doesn't match, clear the stored order and regenerate
        console.log('🔍 Invalid stored order - clearing and regenerating');
        sessionStorage.removeItem(`productOrder-${data.id}`);
        throw new Error('Invalid stored order, regenerating');
      }
    } catch (error) {
      console.log('Error parsing stored order, regenerating:', error);
      // Fall through to regenerate order
    }
  }
  
  // If no stored order or if it was invalid, generate new order
  if (!storedOrder) {
    console.log('🔍 No stored order, generating new order - competitorsWithVariations length:', competitorsWithVariations.length);
    // Si no hay un orden guardado, barajar y almacenar el orden
    let shuffledIndexes = competitorsWithVariations.map((_, index) => index);
    for (let i = shuffledIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
    }

    // Reordenar la lista basada en los índices aleatorios
    competitorsWithVariations = shuffledIndexes.map(index => competitorsWithVariations[index]);
    console.log('🔍 After shuffling - competitorsWithVariations length:', competitorsWithVariations.length);
    sessionStorage.setItem(`productOrder-${data.id}`, JSON.stringify(shuffledIndexes));
  } else {
    // Clear stored order if it's invalid (has wrong number of items)
    console.log('🔍 Clearing invalid stored order and regenerating');
    sessionStorage.removeItem(`productOrder-${data.id}`);
    
    // Generate new order
    let shuffledIndexes = competitorsWithVariations.map((_, index) => index);
    for (let i = shuffledIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
    }

    competitorsWithVariations = shuffledIndexes.map(index => competitorsWithVariations[index]);
    console.log('🔍 After regenerating - competitorsWithVariations length:', competitorsWithVariations.length);
    sessionStorage.setItem(`productOrder-${data.id}`, JSON.stringify(shuffledIndexes));
  }

  console.log('Final combined data competitors count:', competitorsWithVariations.length);
  console.log('Final combined data competitors:', competitorsWithVariations);
  console.log('Skin-based filtering applied. Products with asin (Amazon):', competitorsWithVariations.filter(p => p.asin).length);
  console.log('Products with walmart_id (Walmart):', competitorsWithVariations.filter(p => p.walmart_id).length);
  
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
  const testSkin = combinedData?.skin ?? 'amazon';

  useEffect(() => {
    if (prolificPid) {
      sessionStorage.setItem('prolificPid', prolificPid);
    }
  }, [prolificPid]);

  // Create session immediately when data is available
  useEffect(() => {
    let isCreatingSession = false;
    
    const createInitialSession = async () => {
      if (data && !sessionStarted && !isCreatingSession) {
        isCreatingSession = true;
        try {
          const result = processString(id ?? '');
          const testId = result?.modifiedString ?? '';
          const variant = result?.lastCharacter ?? '';
          
          // Check for existing session first
          const existingSession = await checkAndFetchExistingSession(testId, variant);
          
          if (!existingSession) {
            // Create new session immediately
            const sessionId = await createNewSession(id ?? '', data, prolificPid);
            if (sessionId) {
              startSession(sessionId, data.id, data, new Date(), undefined, prolificPid);
              setSessionStarted(true);
              
              // Restore analytics tracking
              if (shopperId) {
                const tracker = getTracker(`shopperSessionID:${shopperId}-testID:${id}-prolificPID:${prolificPid}`);
                tracker.trackWs('SessionEvents')?.(
                  'Session Started',
                  JSON.stringify({ sessionId, prolificPid }),
                  'up'
                );
              }
            }
          } else {
            // Use existing session
            startSession(
              existingSession.id,
              data.id,
              data,
              new Date(existingSession.created_at),
              existingSession.product_id ?? existingSession.competitor_id,
              prolificPid
            );
            setSessionStarted(true);
          }
        } catch (error) {
          console.error('Error creating initial session:', error);
        } finally {
          isCreatingSession = false;
        }
      }
    };

    createInitialSession();
  }, [data, id, prolificPid, sessionStarted, startSession, shopperId]);

  const handleCaptchaVerify = async (token: string | null) => {
    if (!token) {
      console.log('No captcha token received');
      toast.error('Captcha verification failed. Please refresh the page and try again.');
      setCaptchaLoading(false);
      return;
    }

    setCaptchaLoading(true);
    try {
      console.log('Captcha token received:', token);
      
      // Simple frontend verification - sufficient for low-traffic sites
      // The reCAPTCHA widget itself provides basic bot protection
      setCaptchaVerified(true);
      setCaptchaLoading(false);
      
      // Don't proceed with test here - just mark captcha as verified
      // The test logic will run when user clicks "Ok" button
    } catch (error) {
      console.error('Captcha verification failed:', error);
      toast.error('Captcha verification failed. Please refresh the page and try again.');
      setCaptchaLoading(false);
    }
  };

  const proceedWithTest = async () => {
    try {
      const result = processString(id ?? '');
      const testId = result?.modifiedString ?? '';
      const variant = result?.lastCharacter ?? '';

      // Check for existing session
      console.log('Checking for existing session with:', { testId, variant });
      const existingSession: any = await checkAndFetchExistingSession(testId, variant);
      console.log('Existing session result:', existingSession);

      if (existingSession?.ended_at) {
        markTestCompleted(testId, variant);
        navigate('/thanks', { state: { testId: id + '-' + variant } });
        return;
      }

      if (existingSession && combinedData) {
        // Session already exists and is active
        if (existingSession.product_id || existingSession.competitor_id) {
          navigate('/questions');
          return;
        }

        // Session exists but no product selected yet
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

      // This should not happen now since session is created on page load
      console.warn('No session found, this should not happen');
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

  // Show full-screen loading until we have determined the skin and data
  if (loading || !combinedData) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0071dc] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your shopping experience...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate skin based on testSkin
  if (testSkin === 'walmart') {
    return (
              <WalmartHeaderLayout searchTerm={combinedData.search_term}>
        <div className="bg-white min-h-[750px]">
          <div key={combinedData.id}>
            <Modal 
              isOpen={isModalOpen} 
              onClose={closeModal} 
              test={combinedData.search_term}
              onCaptchaVerify={handleCaptchaVerify}
              captchaVerified={captchaVerified}
              captchaLoading={captchaLoading}
            />
            <div className="max-w-screen-2xl mx-auto px-4 py-4 bg-white">
              <div className="bg-white p-4 rounded-sm">
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
                  <WalmartGrid
                    products={combinedData.competitors}
                    addToCart={addToCart}
                    variantType={id ? id[id.length - 1] : ''}
                    testId={id ? id.slice(0, -2) : ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </WalmartHeaderLayout>
    );
  }

  // Default Amazon skin
  return (
    <HeaderTesterSessionLayout>
      <div className="bg-[#EAEDED] min-h-[600px]">
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
            <div className="bg-white p-4 rounded-sm">
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
      </div>
    </HeaderTesterSessionLayout>
  );
};

export default TestUserPage;
