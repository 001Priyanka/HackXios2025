import React, { useState } from 'react';
import { authService } from '../../services/authService';

const DebugSignup = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    setResult('Testing signup...');

    const testData = {
      name: 'Frontend Debug User',
      phone: '6666666666',
      password: 'testpass123',
      location: 'Frontend City, Frontend Village',
      language: 'English'
    };

    try {
      console.log('Frontend: Sending signup request:', testData);
      console.log('Frontend: Data types:', {
        name: typeof testData.name,
        phone: typeof testData.phone,
        password: typeof testData.password,
        location: typeof testData.location,
        language: typeof testData.language
      });
      
      const response = await authService.signup(testData);
      
      console.log('Frontend: Signup response:', response);
      
      if (response.success) {
        setResult(`✅ Signup Successful!\n${JSON.stringify(response, null, 2)}`);
      } else {
        setResult(`❌ Signup Failed\nMessage: ${response.message}\nErrors: ${JSON.stringify(response.errors, null, 2)}`);
        
        // Log more details for debugging
        console.error('Detailed error info:', {
          message: response.message,
          errors: response.errors,
          fullResponse: response
        });
      }
    } catch (error) {
      console.error('Frontend: Signup error:', error);
      setResult(`❌ Network Error\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setResult('Testing direct fetch...');

    const testData = {
      name: 'Direct Fetch User',
      phone: '5555555555',
      password: 'testpass123',
      location: 'Direct City, Direct Village',
      language: 'English'
    };

    try {
      console.log('Direct fetch: Sending signup request:', testData);
      
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      console.log('Direct fetch: Response status:', response.status);
      const data = await response.json();
      console.log('Direct fetch: Response data:', data);

      if (response.ok) {
        setResult(`✅ Direct Fetch Successful!\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Direct Fetch Failed\nStatus: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('Direct fetch: Error:', error);
      setResult(`❌ Direct Fetch Network Error\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Debug Signup Component</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testSignup} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test AuthService Signup'}
        </button>
        
        <button 
          onClick={testDirectFetch} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        minHeight: '200px'
      }}>
        {result || 'Click a button to test signup functionality'}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Backend URL: http://localhost:5000/api</p>
        <p>Frontend URL: {window.location.origin}</p>
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
};

export default DebugSignup;