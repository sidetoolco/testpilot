const Support: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
          TestPilot Support Center
        </h1>

        <div className="space-y-12">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-transform">
            <h2 className="text-2xl font-semibold mb-4 text-green-800">TestPilot Overview</h2>
            <div className="w-full aspect-video rounded-lg overflow-hidden border-2 border-indigo-100">
              <iframe
                src="https://www.youtube.com/embed/9f-g9f1Vh98?modestbranding=1&showinfo=0"
                className="w-full h-full border-0"
                allowFullScreen
                title="TestPilot Overview"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-transform">
            <h2 className="text-2xl font-semibold mb-4 text-green-800">Creating Your Test</h2>
            <div className="w-full aspect-video rounded-lg overflow-hidden border-2 border-indigo-100">
              <iframe
                src="https://www.youtube.com/embed/2fHblfCsRHA?modestbranding=1&showinfo=0"
                className="w-full h-full border-0"
                allowFullScreen
                title="Creating Your Test"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-transform">
            <h2 className="text-2xl font-semibold mb-4 text-green-800">
              Interpreting Your Results
            </h2>
            <div className="w-full aspect-video rounded-lg overflow-hidden border-2 border-indigo-100">
              <iframe
                src="https://www.youtube.com/embed/6OHXDrahB68?modestbranding=1&showinfo=0"
                className="w-full h-full border-0"
                allowFullScreen
                title="Interpreting Your Results"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
