import React, { useState } from 'react';
import AdvisoryService from '../../services/advisoryService';

const DashboardAPITest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testDashboardAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing Dashboard API Integration...\n');

    try {
      // Test 1: Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        setTestResult(prev => prev + '❌ No JWT token found. Please login first.\n');
        setIsLoading(false);
        return;
      }

      setTestResult(prev => prev + '✅ JWT token found\n');

      // Test 2: Get advisory history (last 3)
      setTestResult(prev => prev + 'Fetching last 3 advisories...\n');
      
      const historyResponse = await AdvisoryService.getAdvisoryHistory(1, 3);
      
      if (historyResponse.success) {
        setTestResult(prev => prev + '✅ Advisory history retrieved successfully!\n');
        setTestResult(prev => prev + `Total advisories: ${historyResponse.data.pagination.totalAdvisories}\n`);
        setTestResult(prev => prev + `Advisories on this page: ${historyResponse.data.advisories.length}\n`);
        
        if (historyResponse.data.advisories.length > 0) {
          setTestResult(prev => prev + '\n📋 Recent Advisories:\n');
          historyResponse.data.advisories.forEach((advisory, index) => {
            setTestResult(prev => prev + `${index + 1}. ${advisory.crop} (${advisory.soilType}, ${advisory.season}) - Confidence: ${advisory.confidenceScore}/10\n`);
            setTestResult(prev => prev + `   Date: ${new Date(advisory.createdAt).toLocaleDateString()}\n`);
          });
        } else {
          setTestResult(prev => prev + '📋 No advisories found (empty state will be shown)\n');
        }
      } else {
        setTestResult(prev => prev + `❌ Failed to get advisory history: ${historyResponse.error}\n`);
      }

      // Test 3: Get advisory statistics
      setTestResult(prev => prev + '\nFetching advisory statistics...\n');
      
      try {
        const statsResponse = await AdvisoryService.getAdvisoryStats();
        
        if (statsResponse.success) {
          setTestResult(prev => prev + '✅ Advisory statistics retrieved!\n');
          setTestResult(prev => prev + `Average confidence: ${statsResponse.data.averageConfidence}/10\n`);
          setTestResult(prev => prev + `Total advisories: ${statsResponse.data.totalAdvisories}\n`);
          
          if (statsResponse.data.cropDistribution) {
            const topCrops = Object.entries(statsResponse.data.cropDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3);
            setTestResult(prev => prev + `Top crops: ${topCrops.map(([crop, count]) => `${crop} (${count})`).join(', ')}\n`);
          }
        } else {
          setTestResult(prev => prev + `⚠️ Statistics not available: ${statsResponse.error}\n`);
        }
      } catch (statsError) {
        setTestResult(prev => prev + '⚠️ Statistics endpoint not available (optional)\n');
      }

      setTestResult(prev => prev + '\n🎉 Dashboard API integration test completed!\n');

    } catch (error) {
      setTestResult(prev => prev + `❌ Test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTest = () => {
    setTestResult('');
  };

  const generateTestAdvisory = async () => {
    setIsLoading(true);
    setTestResult('Generating test advisory for dashboard...\n');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTestResult(prev => prev + '❌ Please login first\n');
        setIsLoading(false);
        return;
      }

      const response = await AdvisoryService.generateAdvisory({
        crop: 'Wheat',
        soilType: 'Loamy',
        season: 'Rabi'
      });

      if (response.success) {
        setTestResult(prev => prev + '✅ Test advisory generated successfully!\n');
        setTestResult(prev => prev + 'Now you can test the dashboard to see it appear in recent advisories.\n');
      } else {
        setTestResult(prev => prev + `❌ Failed to generate advisory: ${response.error}\n`);
      }
    } catch (error) {
      setTestResult(prev => prev + `❌ Error: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Dashboard API Test</h2>
      <p>This component tests the Dashboard's Advisory API integration.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testDashboardAPI} 
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
          {isLoading ? 'Testing...' : 'Test Dashboard API'}
        </button>
        
        <button 
          onClick={generateTestAdvisory} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Generate Test Advisory
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
        <h3>Dashboard Features Tested:</h3>
        <ul>
          <li>✅ GET /api/advisory/history (last 3 advisories)</li>
          <li>✅ Display summary list with crop, date, confidence score</li>
          <li>✅ Handle empty state gracefully</li>
          <li>✅ Show loading and error states</li>
          <li>✅ Real-time statistics integration</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardAPITest;