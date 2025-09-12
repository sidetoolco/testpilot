import { useEffect, useState, useMemo, useCallback } from 'react';
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
  const [data, setData] = useState<TestData | null>(() => {
    // Check if data is already cached in sessionStorage
    if (id) {
      const cachedData = sessionStorage.getItem(`testData-${id}`);
      if (cachedData) {
        try {
          return JSON.parse(cachedData);
        } catch (e) {
          console.warn('Failed to parse cached test data:', e);
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    // If we have cached data, don't show loading
    if (id) {
      const cachedData = sessionStorage.getItem(`testData-${id}`);
      return !cachedData;
    }
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // Check if data is already cached
      const cachedData = sessionStorage.getItem(`testData-${id}`);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setData(parsedData);
          setLoading(false);
          return;
        } catch (e) {
          console.warn('Failed to parse cached test data:', e);
        }
      }

      // Only fetch if not cached
      fetchProductAndCompetitorData(id)
        .then((data: any) => {
          setData(data);
          setLoading(false);
          // Cache the data
          sessionStorage.setItem(`testData-${id}`, JSON.stringify(data));
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
  const storedOrderKey = `productOrder-${data.id}`;
  let storedOrder = sessionStorage.getItem(storedOrderKey);

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
    return competitor;
  });
  
  // Add variations with consistent structure
  data.variations.forEach((variation: any) => {
    if (variation.product) {
      competitorsWithVariations.push(variation.product);
    }
  });

  // Check if we have a valid stored order
  if (storedOrder) {
    try {
      const orderedIndexes = JSON.parse(storedOrder);
      
      // Validate that all indexes are within bounds and count matches
      const validIndexes = orderedIndexes.filter((index: number) => 
        index >= 0 && index < competitorsWithVariations.length
      );
      
      if (validIndexes.length === orderedIndexes.length && validIndexes.length === competitorsWithVariations.length) {
        // Apply the stored order
        competitorsWithVariations = validIndexes.map(
          (index: number) => competitorsWithVariations[index]
        );
        return {
          ...data,
          competitors: competitorsWithVariations,
        };
      } else {
        // Invalid stored order, clear it
        sessionStorage.removeItem(storedOrderKey);
      }
    } catch (error) {
      // Invalid stored order, clear it
      sessionStorage.removeItem(storedOrderKey);
    }
  }
  
  // Generate new order only if no valid stored order exists
  const shuffledIndexes = competitorsWithVariations.map((_: any, index: number) => index);
  for (let i = shuffledIndexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
  }

  // Reorder the list based on shuffled indexes
  competitorsWithVariations = shuffledIndexes.map((index: number) => competitorsWithVariations[index]);
  
  // Store the new order
  sessionStorage.setItem(storedOrderKey, JSON.stringify(shuffledIndexes));
  
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
  const [sessionStarted, setSessionStarted] = useState(() => {
    // Check if session was already started in this session
    return sessionStorage.getItem(`sessionStarted-${id}`) === 'true';
  });
  const [captchaVerified, setCaptchaVerified] = useState(() => {
    // Check if captcha was already verified in this session
    return sessionStorage.getItem(`captchaVerified-${id}`) === 'true';
  });
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [hasShownCaptcha, setHasShownCaptcha] = useState(() => {
    // Check if captcha was already shown in this session
    return sessionStorage.getItem(`hasShownCaptcha-${id}`) === 'true';
  });
  
  // Modal should show if no session started yet OR if captcha not verified
  const isModalOpen = !sessionStarted || !captchaVerified || showCaptchaModal;

  // Memoize the combined data to prevent re-shuffling on every render
  const combinedData = useMemo(() => {
    if (!data) return null;
    return combineVariantsAndCompetitors(data);
  }, [data?.id, data?.competitors, data?.variations]); // Only recalculate when these specific properties change

  const testSkin = combinedData?.skin ?? 'amazon';

  useEffect(() => {
    if (prolificPid) {
      sessionStorage.setItem('prolificPid', prolificPid);
    }
  }, [prolificPid]);

  // Show captcha modal when data is available (only once)
  useEffect(() => {
    if (data && !sessionStarted && !hasShownCaptcha) {
      // Check if test is already completed
      const result = processString(id ?? '');
      const testId = result?.modifiedString ?? '';
      const variant = result?.lastCharacter ?? '';
      
      if (isTestCompleted(testId, variant)) {
        // Test already completed, redirect to thanks page
        navigate('/thanks', { state: { testId: id + '-' + variant } });
        return;
      }
      
      setShowCaptchaModal(true);
      setHasShownCaptcha(true);
      // Persist that captcha has been shown
      sessionStorage.setItem(`hasShownCaptcha-${id}`, 'true');
    }
  }, [data, sessionStarted, hasShownCaptcha, id, isTestCompleted, navigate]);

  const handleCaptchaVerify = async (token: string | null) => {
    if (!token) {
      toast.error('Captcha verification failed. Please refresh the page and try again.');
      setCaptchaLoading(false);
      return;
    }

    setCaptchaLoading(true);
    try {
      setCaptchaVerified(true);
      setCaptchaLoading(false);
      sessionStorage.setItem(`captchaVerified-${id}`, 'true');
    } catch (error) {
      console.error('Captcha verification failed:', error);
      toast.error('Captcha verification failed. Please refresh the page and try again.');
      setCaptchaLoading(false);
    }
  };


  const closeModal = async () => {
    // Only proceed if captcha is verified
    if (!captchaVerified) {
      return;
    }
    
    // Create session after captcha verification
    await createSessionAfterCaptcha();
  };

  const createSessionAfterCaptcha = async () => {
    if (!data || sessionStarted) return;
    
    try {
      const result = processString(id ?? '');
      const testId = result?.modifiedString ?? '';
      const variant = result?.lastCharacter ?? '';
      
      // Check if test is already completed
      if (isTestCompleted(testId, variant)) {
        navigate('/thanks', { state: { testId: id + '-' + variant } });
        return;
      }
      
      // Check for existing session first
      const existingSession = await checkAndFetchExistingSession(testId, variant);
      
      // Type guard to check if existingSession is a valid session object
      if (existingSession && typeof existingSession === 'object' && 'id' in existingSession && !('error' in existingSession)) {
        const session = existingSession as any; // Type assertion for session object
        if (session.ended_at) {
          markTestCompleted(testId, variant);
          navigate('/thanks', { state: { testId: id + '-' + variant } });
          return;
        }
        
        // Use existing session
        startSession(
          session.id,
          data.id,
          data,
          new Date(session.created_at),
          session.product_id ?? session.competitor_id,
          prolificPid
        );
        setSessionStarted(true);
        setShowCaptchaModal(false);
        // Persist session started state
        sessionStorage.setItem(`sessionStarted-${id}`, 'true');
        
        // Restore analytics tracking for resumed session
        const tracker = getTracker(
          `shopperSessionID:${session.id}-testID:${id}-prolificPID:${prolificPid}`
        );
        tracker.trackWs('SessionEvents')?.(
          'Session Resumed',
          JSON.stringify({ sessionId: session.id, prolificPid }),
          'up'
        );
        
        // Check if user already selected a product
        if (session.product_id || session.competitor_id) {
          navigate('/questions');
          return;
        }
      } else {
        // Create new session
        const sessionId = await createNewSession(id ?? '', data, prolificPid);
        if (sessionId) {
          startSession(sessionId, data.id, data, new Date(), undefined, prolificPid);
          setSessionStarted(true);
          setShowCaptchaModal(false);
          // Persist session started state
          sessionStorage.setItem(`sessionStarted-${id}`, 'true');
          
          // Restore analytics tracking
          const tracker = getTracker(`shopperSessionID:${sessionId}-testID:${id}-prolificPID:${prolificPid}`);
          tracker.trackWs('SessionEvents')?.(
            'Session Started',
            JSON.stringify({ sessionId, prolificPid }),
            'up'
          );
        }
      }
    } catch (error) {
      console.error('Error creating session after captcha:', error);
      toast.error('Failed to start session. Please try again.');
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

  const addToCart = useCallback((item: any) => {
    if (cartItems.length === 0) {
      useSessionStore.getState().selectItemAtCheckout(item);
      const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + id);
      tracker.trackWs('CartEvents')?.('Item Added', JSON.stringify({ item }), 'up');
    }
  }, [cartItems.length, shopperId, id]);

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
                    mainProduct={combinedData.variations?.[0]?.product}
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
                  mainProduct={combinedData.variations?.[0]?.product}
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
