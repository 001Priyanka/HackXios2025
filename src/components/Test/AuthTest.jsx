import React, { useState } from 'react';
import { authService } from '../../services/authService';
import api from '../../services/api';

const AuthTest = () => {
  const [testResults, setTestResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const runAuthTests = async () => {
    setIsLoading(true);
    setTestResults('🧪 Testing Frontend Auth Integration...\n\n');

    try {
      // Test 1: Direct API call
      setTestResults(prev => prev + '1. Testing direct API connection...\n');
      
      try {
        const healthResponse = await api.get('/health');
        setTestResults(prev => prev + '✅ Direct API connection successful\n');
        setTestResults(prev => prev + `   Response: ${healthResponse.data.message}\n\n`);
      } catch (error) {
        setTestResults(prev => prev + '❌ Direct API connection failed\n');
        setTestResults(prev => prev + `   Error: ${error.message}\n\n`);
        return;
      }

      // Test 2: Test signup with authService
      setTestResults(prev => prev + '2. Testing signup with authService...\n');
      
      const newPhoneNumber = '9876543' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const signupData = {
        name: 'Frontend Test User',
        phone: newPhoneNumber,
        password: 'testpass123',
        location: 'Frontend Test District, Frontend Test Village',
        language: 'English'
      };

      setTestResults(prev => prev + `   Phone: ${newPhoneNumber}\n`);

      try {
        const signupResult = await authService.signup(signupData);
        
        if (signupResult.success) {
          setTestResults(prev => prev + '✅ Signup successful via authService\n');
          setTestResults(prev => prev + `   Message: ${signupResult.message}\n`);
          setTestResults(prev => prev + `   User: ${signupResult.data.data.user.name}\n\n`);

          // Test 3: Test login with the same credentials
          setTestResults(prev => prev + '3. Testing login with authService...\n');
          
          const loginResult = await authService.login({
            phone: newPhoneNumber,
            password: 'testpass123'
          });

          if (loginResult.success) {
            setTestResults(prev => prev + '✅ Login successful via authService\n');
            setTestResults(prev => prev + `   Message: ${loginResult.message}\n`);
            setTestResults(prev => prev + `   Token stored: ${!!localStorage.getItem('token')}\n`);
            setTestResults(prev => prev + `   User stored: ${!!localStorage.getItem('user')}\n\n`);
          } else {
            setTestResults(prev => prev + '❌ Login failed via authService\n');
            setTestResults(prev => prev + `   Error: ${loginResult.message}\n\n`);
          }

        } else {
          setTestResults(prev => prev + '❌ Signup failed via authService\n');
          setTestResults(prev => prev + `   Error: ${signupResult.message}\n`);
          if (signupResult.errors && signupResult.errors.length > 0) {
            setTestResults(prev => prev + `   Details: ${signupResult.errors.join(', ')}\n`);
          }
          setTestResults(prev => prev + '\n');
        }

      } catch (error) {
        setTestResults(prev => prev + '❌ Signup threw exception\n');
        setTestResults(prev => prev + `   Error: ${error.message}\n\n`);
      }

      // Test 4: Test with existing user
      setTestResults(prev => prev + '4. Testing login with known working credentials...\n');
      
      try {
        const knownLoginResult = await authService.login({
          phone: '9876543210',
          password: 'password123'
        });

        if (knownLoginResult.success) {
          setTestResults(prev => prev + '✅ Known user login successful\n');
          setTestResults(prev => prev + `   User: ${knownLoginResult.user.name}\n\n`);
        } else {
          setTestResults(prev => prev + '❌ Known user login failed\n');
          setTestResults(prev => prev + `   Error: ${knownLoginResult.message}\n\n`);
        }
      } catch (error) {
        setTestResults(prev => prev + '❌ Known user login threw exception\n');
        setTestResults(prev => prev + `   Error: ${error.message}\n\n`);
      }

      setTestResults(prev => prev + '🎉 Frontend auth tests completed!\n');

    } catch (error) {
      setTestResults(prev => prev + `❌ Test suite failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults('');
  };

  const testCurrentAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setTestResults(`Current Auth State:\n\n`);
    setTestResults(prev => prev + `Token exists: ${!!token}\n`);
    setTestResults(prev => prev + `User exists: ${!!user}\n`);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setTestResults(prev => prev + `User name: ${userData.name}\n`);
        setTestResults(prev => prev + `User phone: ${userData.phone}\n`);
      } catch (error) {
        setTestResults(prev => prev + `User data parse error: ${error.message}\n`);
      }
    }
    
    setTestResults(prev => prev + `Is authenticated: ${authService.isAuthenticated()}\n`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Frontend Auth Test</h2>
      <p>This component tests the frontend authentication integration with the backend API.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAuthTests} 
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
          {isLoading ? 'Testing...' : 'Run Auth Tests'}
        </button>
        
        <button 
          onClick={testCurrentAuth}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Check Current Auth
        </button>
        
        <button 
          onClick={clearResults}
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

      {testResults && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-line',
          border: '1px solid #ddd',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          {testResults}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure the backend server is running on localhost:5000</li>
          <li>Click "Run Auth Tests" to test signup and login functionality</li>
          <li>Check the console for additional debug information</li>
          <li>Use "Check Current Auth" to see current authentication state</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthTest;