import { useState } from 'react';
import { toast } from 'sonner';

const ResearcherForm = () => {
  const [researcherId, setResearcherId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      publicTitle: `Test Project`,
      publicInternalName: `Test-${Date.now()}`,
      participantTimeRequiredMinutes: 12,
      incentiveAmount: 12,
      targetNumberOfParticipants: 10,
      externalResearcher: {
        researcherId,
        researcherName: 'Test Researcher'
      }
    };

    try {
      const response = await fetch('https://sidetool.app.n8n.cloud/webhook/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      toast.success('Project created successfully');
      setResearcherId(''); // Limpiar el input después del éxito
    } catch (error) {
      toast.error('Error creating project');
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label htmlFor="researcherId" className="block mb-2 text-sm font-medium">
          Researcher ID
        </label>
        <input
          id="researcherId"
          type="text"
          value={researcherId}
          onChange={(e) => setResearcherId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Create Project
      </button>
    </form>
  );
};

export default ResearcherForm;