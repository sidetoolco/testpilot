import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Report from '../features/tests/components/Report/ReportMain';

export default function TestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div className="h-screen overflow-hidden bg-[#f9fcfa] flex flex-col">
      <div className="flex-1 mx-auto w-full overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 py-6 h-[100vh]">
          <button
            onClick={() => navigate('/my-tests')}
            className="mb-6 px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
            <span className="font-medium">Back to tests</span>
          </button>
          <Report id={id || ''} />
        </div>
      </div>
    </div>
  );
}
