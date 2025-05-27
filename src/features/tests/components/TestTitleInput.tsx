import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface TestTitleInputProps {
  testId?: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

export default function TestTitleInput({
  testId,
  initialValue = '',
  onChange,
}: TestTitleInputProps) {
  const [title, setTitle] = useState(initialValue);

  useEffect(() => {
    if (testId) {
      // Fetch existing test title if testId is provided
      const fetchTestTitle = async () => {
        const { data, error } = await supabase
          .from('test_sessions')
          .select('name')
          .eq('id', testId)
          .single();

        if (!error && data) {
          setTitle(data.name);
          onChange(data.name);
        }
      };

      fetchTestTitle();
    }
  }, [testId]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onChange(newTitle);

    if (testId) {
      // Update test title in database if testId is provided
      await supabase.from('test_sessions').update({ name: newTitle }).eq('id', testId);
    }
  };

  return (
    <div className="mb-8">
      <label htmlFor="testTitle" className="block text-sm font-medium text-gray-700 mb-2">
        Test Title
      </label>
      <input
        id="testTitle"
        type="text"
        value={title}
        onChange={handleChange}
        placeholder="Enter a descriptive title for your test"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors"
        required
      />
      <p className="mt-2 text-sm text-gray-500">
        A clear title helps you identify and manage your tests
      </p>
    </div>
  );
}
