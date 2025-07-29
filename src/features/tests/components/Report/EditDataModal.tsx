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
  competitive_insights: string;
  recommendations: string;
  sendEmail: boolean | null;
  comment_summary: string;
  variant_type: string | null;
  edited?: boolean;
}

// Only the fields that can be edited
interface EditableInsightData {
  id: number;
  comparison_between_variants: string;
  purchase_drivers: string;
  competitive_insights: string;
  recommendations: string;
  comment_summary: string;
  variant_type: string | null;
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
      // Load AI insights from your API
      const response = await apiClient.get(`/insights/${testId}?type=ai`);
      
      // Get all insights and organize them by type
      const allInsights = response.data || [];
      
      const editableData: EditableInsightData[] = [];
      
      // Find the main insight (variant A) that contains the general fields
      const mainInsight = allInsights.find((item: AIInsightData) => 
        item.variant_type === 'a'
      );
      
      // Find the purchase drivers insight (variant_type = null)
      const purchaseDriversInsight = allInsights.find((item: AIInsightData) => 
        item.variant_type === null
      );
      
      if (mainInsight) {
        // Add the main insight with general fields
        editableData.push({
          id: mainInsight.id,
          comparison_between_variants: mainInsight.comparison_between_variants,
          purchase_drivers: '', // Will be handled separately from variant null
          competitive_insights: '', // Will be handled separately for each variant
          recommendations: mainInsight.recommendations,
          comment_summary: mainInsight.comment_summary,
          variant_type: 'a',
          edited: false,
        });
      }
      
      // Add purchase drivers insight (variant_type = null) separately
      if (purchaseDriversInsight) {
        editableData.push({
          id: purchaseDriversInsight.id,
          comparison_between_variants: '', // Not editable for purchase drivers
          purchase_drivers: purchaseDriversInsight.purchase_drivers,
          competitive_insights: '', // Not editable for purchase drivers
          recommendations: '', // Not editable for purchase drivers
          comment_summary: '', // Not editable for purchase drivers
          variant_type: null,
          edited: false,
        });
      }
      
      // Add competitive insights for all variants (A, B, C) if they exist
      const competitiveInsights = allInsights.filter((item: AIInsightData) => 
        item.variant_type && ['a', 'b', 'c'].includes(item.variant_type) && item.competitive_insights
      );
      
      competitiveInsights.forEach((item: AIInsightData) => {
        editableData.push({
          id: item.id,
          comparison_between_variants: '', // Not editable for competitive insights
          purchase_drivers: '', // Not editable for competitive insights
          competitive_insights: item.competitive_insights,
          recommendations: '', // Not editable for competitive insights
          comment_summary: '', // Not editable for competitive insights
          variant_type: item.variant_type,
          edited: false,
        });
      });
      
      setEditableInsightsData(editableData);
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
      // Save each insight that has been modified
      const savePromises = editableInsightsData.map(async (item) => {
        // Only save if the item has an ID (exists in database)
        if (item.id) {
          const updateData: any = {};
          
          // Determine what fields to update based on the insight type
          const isGeneralInsight = item.variant_type === 'a' && 
            (item.comparison_between_variants || item.recommendations || item.comment_summary);
          
          const isPurchaseDriversInsight = item.variant_type === null && item.purchase_drivers;
          
          const isCompetitiveInsight = item.variant_type && ['a', 'b', 'c'].includes(item.variant_type) && 
            item.competitive_insights;
          
          if (isGeneralInsight) {
            // Update general fields for variant A
            if (item.comparison_between_variants !== '') {
              updateData.comparison_between_variants = item.comparison_between_variants;
            }
            if (item.comment_summary !== '') {
              updateData.comment_summary = item.comment_summary;
            }
            if (item.recommendations !== '') {
              updateData.recommendations = item.recommendations;
            }
            // Add edited flag if any field was changed
            if (item.edited) {
              updateData.edited = true;
            }
          }
          
          if (isPurchaseDriversInsight) {
            // Update purchase drivers for variant_type = null
            if (item.purchase_drivers !== '') {
              updateData.purchase_drivers = item.purchase_drivers;
            }
            // Add edited flag if any field was changed
            if (item.edited) {
              updateData.edited = true;
            }
          }
          
          if (isCompetitiveInsight) {
            // Update competitive insights for any variant (A, B, C)
            if (item.competitive_insights !== '') {
              updateData.competitive_insights = item.competitive_insights;
            }
            // Add edited flag if any field was changed
            if (item.edited) {
              updateData.edited = true;
            }
          }
          
          // Only make the API call if there are fields to update
          if (Object.keys(updateData).length > 0) {
            try {
              console.log(`Attempting to update insight ${item.id} with data:`, updateData);
              return await apiClient.put(`/insights/${item.id}`, updateData);
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
      });
      
      // Wait for all save operations to complete
      const results = await Promise.allSettled(savePromises.filter(Boolean));
      
      // Check if any operations failed
      const failedResults = results.filter(result => result.status === 'rejected');
      if (failedResults.length > 0) {
        const errorMessages = failedResults.map(result => 
          result.status === 'rejected' ? (result as PromiseRejectedResult).reason : ''
        ).join(', ');
        
        // If it's a 404 error, show a more helpful message
        if (errorMessages.includes('not found')) {
          toast.error('Backend PUT endpoint not implemented yet. Please contact your backend developer to implement the PUT /insights/{insightId} endpoint.');
        } else {
          throw new Error(`Some insights failed to update: ${errorMessages}`);
        }
      } else {
              toast.success('Insights updated successfully!');
      onClose();
      // Reload the page to reflect changes
      window.location.reload();
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
                    {/* 1. Summary */}
                    {editableInsightsData.map((item, index) => {
                      const isGeneralInsight = item.variant_type === 'a' && 
                        (item.comparison_between_variants || item.recommendations || item.comment_summary);
                      
                      if (isGeneralInsight) {
                        return (
                          <div key={`summary-${item.id}`} className="border border-gray-300 rounded-lg p-4">
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
                        );
                      }
                      return null;
                    })}

                    {/* 2. Purchase Drivers */}
                    {editableInsightsData.map((item, index) => {
                      const isPurchaseDriversInsight = item.variant_type === null && item.purchase_drivers;
                      
                      if (isPurchaseDriversInsight) {
                        return (
                          <div key={`purchase-drivers-${item.id}`} className="border border-gray-300 rounded-lg p-4">
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
                        );
                      }
                      return null;
                    })}

                    {/* 3. Competitive Insights */}
                    {editableInsightsData.map((item, index) => {
                      const isCompetitiveInsight = item.variant_type && ['a', 'b', 'c'].includes(item.variant_type) && 
                        item.competitive_insights;
                      
                      if (isCompetitiveInsight) {
                        return (
                          <div key={`competitive-${item.id}-${item.variant_type}`} className="border border-gray-300 rounded-lg p-4">
                            <h4 className="font-medium mb-3 text-blue-600">
                              Competitive Insights - Variant {item.variant_type?.toUpperCase()}
                            </h4>
                            <div>
                              <textarea
                                value={item.competitive_insights}
                                onChange={(e) => updateEditableInsightData(index, 'competitive_insights', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* 4. Shopper Comments */}
                    {editableInsightsData.map((item, index) => {
                      const isGeneralInsight = item.variant_type === 'a' && 
                        (item.comparison_between_variants || item.recommendations || item.comment_summary);
                      
                      if (isGeneralInsight) {
                        return (
                          <div key={`comments-${item.id}`} className="border border-gray-300 rounded-lg p-4">
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
                        );
                      }
                      return null;
                    })}

                    {/* 5. Recommendations */}
                    {editableInsightsData.map((item, index) => {
                      const isGeneralInsight = item.variant_type === 'a' && 
                        (item.comparison_between_variants || item.recommendations || item.comment_summary);
                      
                      if (isGeneralInsight) {
                        return (
                          <div key={`recommendations-${item.id}`} className="border border-gray-300 rounded-lg p-4">
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
                        );
                      }
                      return null;
                    })}
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