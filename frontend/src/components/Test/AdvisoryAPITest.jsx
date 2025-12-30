import React, { useState } from 'react';
import AdvisoryService from '../../services/advisoryService';

const AdvisoryAPITest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing API...\n');

    try {
      // Test 1: Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setTestResult(prev => prev + '❌ No JWT token found. Please login first.\n');
        setIsLoading(false);
        return;
      }

      setTestResult(prev => prev + '✅ JWT token found\n');

      // Test 2: Generate advisory
      setTestResult(prev => prev + 'Generating advisory...\n');
      
      const response = await AdvisoryService.generateAdvisory({
        crop: 'Rice',
        soilType: 'Clay',
        season: 'Kharif'
      });

      if (response.success) {
        setTestResult(prev => prev + '✅ Advisory generated successfully!\n');
        setTestResult(prev => prev + `Advisory ID: ${response.data.advisoryId}\n`);
        setTestResult(prev => prev + `Confidence: ${response.data.advisory.overallConfidence}/10\n`);
        setTestResult(prev => prev + `Crop Advice: ${response.data.advisory.recommendations.crop.advice.substring(0, 100)}...\n`);
        
        // Store in localStorage for testing
        localStorage.setItem('currentAdvisory', JSON.stringify(response.data));
        setTestResult(prev => prev + '✅ Advisory saved to localStorage\n');
        
      } else {
        setTestResult(prev => prev + `❌ Advisory generation failed: ${response.error}\n`);
      }

      // Test 3: Get advisory history
      setTestResult(prev => prev + 'Getting advisory history...\n');
      
      const historyResponse = await AdvisoryService.getAdvisoryHistory(1, 5);
      
      if (historyResponse.success) {
        setTestResult(prev => prev + '✅ Advisory history retrieved successfully!\n');
        setTestResult(prev => prev + `Total advisories: ${historyResponse.data.pagination.totalAdvisories}\n`);
        setTestResult(prev => prev + `Latest advisory: ${historyResponse.data.advisories[0]?.crop || 'None'}\n`);
      } else {
        setTestResult(prev => prev + `❌ History retrieval failed: ${historyResponse.error}\n`);
      }

    } catch (error) {
      setTestResult(prev => prev + `❌ Test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTest = () => {
    setTestResult('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Advisory API Test</h2>
      <p>This component tests the Advisory API integration.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testAPI} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Advisory API'}
        </button>
        
        <button 
          onClick={clearTest}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      {testResult && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-line',
          border: '1px solid #ddd'
        }}>
          {testResult}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Prerequisites:</h3>
        <ul>
          <li>Backend server running on localhost:5000</li>
          <li>User must be logged in (JWT token in localStorage)</li>
          <li>MongoDB connected and Advisory model available</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvisoryAPITest;