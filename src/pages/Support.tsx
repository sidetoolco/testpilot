const Support: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
      <ul className="list-disc pl-5">
        <li className="mb-2">
          <strong>Question 1:</strong> How can I reset my password?
          <p>
            Answer: You can reset your password by clicking on the 'Forgot
            Password' link on the login page.
          </p>
        </li>
        <li className="mb-2">
          <strong>Question 2:</strong> How do I contact support?
          <p>
            Answer: You can contact support by emailing support@example.com or
            calling 1-800-555-0199.
          </p>
        </li>
        <li className="mb-2">
          <strong>Question 3:</strong> Where can I find the user manual?
          <p>
            Answer: The user manual is available for download on our website
            under the 'Resources' section.
          </p>
        </li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">TestPilot Overview</h2>
      <div className="w-full aspect-video mb-4 sm:w-1/2 bg-black">
        <iframe
          src="https://www.youtube.com/embed/9f-g9f1Vh98?modestbranding=1&showinfo=0"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
      <h2 className="text-xl font-semibold mb-2">Creating Your Test</h2>
      <div className="w-full aspect-video mb-4 sm:w-1/2 bg-black">
        <iframe
          src="https://www.youtube.com/embed/2fHblfCsRHA?modestbranding=1&showinfo=0"
          className="w-full h-full border-0"
        />
      </div>
      <h2 className="text-xl font-semibold mb-2">Interpreting Your Results</h2>
      <div className="w-full aspect-video mb-4 sm:w-1/2 bg-black">
      <iframe
          src="https://www.youtube.com/embed/6OHXDrahB68?modestbranding=1&showinfo=0"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default Support;
