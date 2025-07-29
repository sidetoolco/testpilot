import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../../../lib/api';

interface EditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  testName: string;
}

interface AIInsightData {
  id: number;
  created_at: string;
  test_id: string;
  comparison_between_variants: string;
  purchase_drivers: string;
  competitive_insights_a?: string;
  competitive_insights_b?: string;
  competitive_insights_c?: string;
  recommendations: string;
  sendEmail: boolean | null;
  comment_summary: string;
  edited?: boolean;
}

// Only the fields that can be edited
interface EditableInsightData {
  id: number;
  comparison_between_variants: string;
  purchase_drivers: string;
  competitive_insights_a?: string;
  competitive_insights_b?: string;
  competitive_insights_c?: string;
  recommendations: string;
  comment_summary: string;
  edited: boolean;
}

export const EditDataModal: React.FC<EditDataModalProps> = ({
  isOpen,
  onClose,
  testId,
  testName,
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editableInsightsData, setEditableInsightsData] = useState<EditableInsightData[]>([]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && testId) {
      loadData();
    }
  }, [isOpen, testId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load AI insights from your API - now returns a single object
      const response = await apiClient.get(`/insights/${testId}?type=ai`);
      
      // Handle both array and single object responses
      let insightData: AIInsightData;
      if (Array.isArray(response.data) && response.data.length > 0) {
        insightData = response.data[0]; // Extract the first (and only) object from array
      } else {
        insightData = response.data;
      }
      
      if (insightData) {
        const editableData: EditableInsightData[] = [];
        
        // Create a single editable object with all the data
        editableData.push({
          id: insightData.id,
          comparison_between_variants: insightData.comparison_between_variants || '',
          purchase_drivers: insightData.purchase_drivers || '',
          competitive_insights_a: insightData.competitive_insights_a || '',
          competitive_insights_b: insightData.competitive_insights_b || '',
          competitive_insights_c: insightData.competitive_insights_c || '',
          recommendations: insightData.recommendations || '',
          comment_summary: insightData.comment_summary || '',
          edited: false,
        });
        
        setEditableInsightsData(editableData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load insights data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save the single insight object
      const item = editableInsightsData[0];
      if (item && item.id) {
        const updateData: any = {};
        
        // Update all fields that have been modified
        if (item.comparison_between_variants !== '') {
          updateData.comparison_between_variants = item.comparison_between_variants;
        }
        if (item.purchase_drivers !== '') {
          updateData.purchase_drivers = item.purchase_drivers;
        }
        if (item.competitive_insights_a !== '') {
          updateData.competitive_insights_a = item.competitive_insights_a;
        }
        if (item.competitive_insights_b !== '') {
          updateData.competitive_insights_b = item.competitive_insights_b;
        }
        if (item.competitive_insights_c !== '') {
          updateData.competitive_insights_c = item.competitive_insights_c;
        }
        if (item.recommendations !== '') {
          updateData.recommendations = item.recommendations;
        }
        if (item.comment_summary !== '') {
          updateData.comment_summary = item.comment_summary;
        }
        
        // Add edited flag if any field was changed
        if (item.edited) {
          updateData.edited = true;
        }
        
        // Only make the API call if there are fields to update
        if (Object.keys(updateData).length > 0) {
          try {
            console.log(`Attempting to update insight ${item.id} with data:`, updateData);
            await apiClient.put(`/insights/${item.id}`, updateData);
            toast.success('Insights updated successfully!');
            onClose();
            // Reload the page to reflect changes
            window.location.reload();
          } catch (error: any) {
            console.error(`Error updating insight ${item.id}:`, error);
            
            // Check if it's a 404 error (endpoint not found)
            if (error.response?.status === 404) {
              throw new Error(`PUT endpoint /insights/${item.id} not found. Please ensure the backend PUT endpoint is implemented.`);
            }
            
            throw new Error(`Failed to update insight ${item.id}: ${error.response?.data?.message || error.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(error.message || 'Failed to save insights. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateEditableInsightData = (index: number, field: keyof EditableInsightData, value: any) => {
    const updated = [...editableInsightsData];
    updated[index] = { ...updated[index], [field]: value, edited: true };
    setEditableInsightsData(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Test Insights - {testName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'insights'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Insights
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Insights Tab */}
              {activeTab === 'insights' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Edit AI Insights</h3>
                  <div className="space-y-6">
                    {editableInsightsData.map((item, index) => (
                      <div key={`insights-${item.id}`} className="space-y-6">
                        {/* 1. Summary */}
                        <div className="border border-gray-300 rounded-lg p-4">
                          <h4 className="font-medium mb-3 text-blue-600">Summary</h4>
                          <div>
                            <textarea
                              value={item.comparison_between_variants}
                              onChange={(e) => updateEditableInsightData(index, 'comparison_between_variants', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        {/* 2. Purchase Drivers */}
                        <div className="border border-gray-300 rounded-lg p-4">
                          <h4 className="font-medium mb-3 text-blue-600">Purchase Drivers</h4>
                          <div>
                            <textarea
                              value={item.purchase_drivers}
                              onChange={(e) => updateEditableInsightData(index, 'purchase_drivers', e.target.value)}
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        {/* 3. Competitive Insights */}
                        {['a', 'b', 'c'].map(variant => {
                          const fieldName = `competitive_insights_${variant}` as keyof EditableInsightData;
                          const content = item[fieldName] as string;
                          
                          // Only show field if there's content or if it's variant A (always show)
                          if (!content && variant !== 'a') {
                            return null;
                          }
                          
                          return (
                            <div key={`competitive-${variant}`} className="border border-gray-300 rounded-lg p-4">
                              <h4 className="font-medium mb-3 text-blue-600">
                                Competitive Insights - Variant {variant.toUpperCase()}
                              </h4>
                              <div>
                                <textarea
                                  value={content || ''}
                                  onChange={(e) => updateEditableInsightData(index, fieldName, e.target.value)}
                                  rows={6}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder={`Enter competitive insights for variant ${variant.toUpperCase()}...`}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {/* 4. Shopper Comments */}
                        <div className="border border-gray-300 rounded-lg p-4">
                          <h4 className="font-medium mb-3 text-blue-600">Shopper Comments</h4>
                          <div>
                            <textarea
                              value={item.comment_summary}
                              onChange={(e) => updateEditableInsightData(index, 'comment_summary', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        {/* 5. Recommendations */}
                        <div className="border border-gray-300 rounded-lg p-4">
                          <h4 className="font-medium mb-3 text-blue-600">Recommendations</h4>
                          <div>
                            <textarea
                              value={item.recommendations}
                              onChange={(e) => updateEditableInsightData(index, 'recommendations', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Insights...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Insights
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 