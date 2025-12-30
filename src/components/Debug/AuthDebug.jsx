import React, { useState } from 'react';
import { authService } from '../../services/authService';

const AuthDebug = () => {
  const [signupData, setSignupData] = useState({
    name: 'Debug User',
    phone: '9876543999',
    password: 'debug123',
    location: 'Debug City, Debug State',
    language: 'English'
  });

  const [loginData, setLoginData] = useState({
    phone: '9876543999',
    password: 'debug123'
  });

  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    setIsLoading(true);
    setResults('Testing signup...\n');

    try {
      const result = await authService.signup(signupData);
      
      if (result.success) {
        setResults(prev => prev + '✅ Signup successful!\n');
        setResults(prev => prev + `Message: ${result.message}\n`);
        setResults(prev => prev + `User: ${result.data.data.user.name}\n`);
        setResults(prev => prev + `Phone: ${result.data.data.user.phone}\n`);
      } else {
        setResults(prev => prev + '❌ Signup failed!\n');
        setResults(prev => prev + `Error: ${result.message}\n`);
        if (result.errors) {
          setResults(prev => prev + `Details: ${result.errors.join(', ')}\n`);
        }
      }
    } catch (error) {
      setResults(prev => prev + `❌ Exception: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setResults('Testing login...\n');

    try {
      const result = await authService.login(loginData);
      
      if (result.success) {
        setResults(prev => prev + '✅ Login successful!\n');
        setResults(prev => prev + `Message: ${result.message}\n`);
        setResults(prev => prev + `User: ${result.user.name}\n`);
        setResults(prev => prev + `Token stored: ${!!localStorage.getItem('token')}\n`);
      } else {
        setResults(prev => prev + '❌ Login failed!\n');
        setResults(prev => prev + `Error: ${result.message}\n`);
      }
    } catch (error) {
      setResults(prev => prev + `❌ Exception: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKnownUserLogin = async () => {
    setIsLoading(true);
    setResults('Testing login with known user...\n');

    try {
      const result = await authService.login({
        phone: '9876543210',
        password: 'password123'
      });
      
      if (result.success) {
        setResults(prev => prev + '✅ Known user login successful!\n');
        setResults(prev => prev + `User: ${result.user.name}\n`);
      } else {
        setResults(prev => prev + '❌ Known user login failed!\n');
        setResults(prev => prev + `Error: ${result.message}\n`);
      }
    } catch (error) {
      setResults(prev => prev + `❌ Exception: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPhone = () => {
    const randomPhone = '9876543' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setSignupData(prev => ({ ...prev, phone: randomPhone }));
    setLoginData(prev => ({ ...prev, phone: randomPhone }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Auth Debug Tool</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Signup Data</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={signupData.name}
            onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Phone"
            value={signupData.phone}
            onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={signupData.password}
            onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Location"
            value={signupData.location}
            onChange={(e) => setSignupData(prev => ({ ...prev, location: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button 
          onClick={generateRandomPhone}
          style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Generate Random Phone
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Login Data</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Phone"
            value={loginData.phone}
            onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleSignup} 
          disabled={isLoading}
          style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}
        >
          Test Signup
        </button>
        
        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}
        >
          Test Login
        </button>
        
        <button 
          onClick={handleKnownUserLogin} 
          disabled={isLoading}
          style={{ padding: '10px 20px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}
        >
          Test Known User
        </button>
        
        <button 
          onClick={() => setResults('')}
          style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Clear
        </button>
      </div>

      {results && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-line',
          border: '1px solid #ddd'
        }}>
          {results}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Backend Status:</strong> {window.location.protocol}//{window.location.hostname}:5000/api</p>
        <p><strong>Current Auth:</strong> {authService.isAuthenticated() ? 'Authenticated' : 'Not authenticated'}</p>
      </div>
    </div>
  );
};

export default AuthDebug;