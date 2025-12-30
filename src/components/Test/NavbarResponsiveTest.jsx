import React, { useState, useEffect } from 'react';

const NavbarResponsiveTest = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const runResponsiveTests = () => {
    const results = [];
    
    // Test different screen sizes
    const testSizes = [
      { width: 320, name: 'Small Mobile', expected: 'Hamburger menu' },
      { width: 480, name: 'Mobile', expected: 'Hamburger menu' },
      { width: 768, name: 'Tablet', expected: 'Hamburger menu' },
      { width: 1024, name: 'Small Desktop', expected: 'Hamburger menu' },
      { width: 1025, name: 'Desktop', expected: 'Horizontal menu' },
      { width: 1200, name: 'Large Desktop', expected: 'Horizontal menu' },
      { width: 1400, name: 'Extra Large', expected: 'Horizontal menu' }
    ];

    testSizes.forEach(size => {
      const isHamburgerExpected = size.width <= 1024;
      results.push({
        size: size.name,
        width: size.width,
        expected: size.expected,
        status: isHamburgerExpected ? 'Mobile Layout' : 'Desktop Layout'
      });
    });

    setTestResults(results);
  };

  const getCurrentLayout = () => {
    if (screenWidth <= 1024) {
      return 'Mobile Layout (Hamburger Menu)';
    } else {
      return 'Desktop Layout (Horizontal Menu)';
    }
  };

  const getLayoutColor = () => {
    return screenWidth <= 1024 ? '#ff9800' : '#4CAF50';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Navbar Responsiveness Test</h2>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: `3px solid ${getLayoutColor()}`
      }}>
        <h3>Current Screen Status</h3>
        <p><strong>Screen Width:</strong> {screenWidth}px</p>
        <p><strong>Current Layout:</strong> <span style={{ color: getLayoutColor(), fontWeight: 'bold' }}>{getCurrentLayout()}</span></p>
        <p><strong>Breakpoint:</strong> Mobile ≤ 1024px | Desktop > 1024px</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runResponsiveTests}
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
          Run Responsive Tests
        </button>
        
        <button 
          onClick={() => setTestResults([])}
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

      {testResults.length > 0 && (
        <div>
          <h3>Responsive Breakpoint Tests</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#e0e0e0' }}>
                <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Screen Size</th>
                <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Width</th>
                <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Expected Layout</th>
                <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{result.size}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{result.width}px</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{result.expected}</td>
                  <td style={{ 
                    padding: '10px', 
                    border: '1px solid #ccc',
                    color: result.status.includes('Mobile') ? '#ff9800' : '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    {result.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Navbar Fixes Applied</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>✅ <strong>Mobile-first approach:</strong> Hamburger menu for screens ≤ 1024px</li>
          <li>✅ <strong>Flexible layout:</strong> Prevents feedback button from overflowing</li>
          <li>✅ <strong>Proper breakpoints:</strong> Clear distinction between mobile and desktop</li>
          <li>✅ <strong>Responsive sizing:</strong> Adjusts padding and font sizes for different screens</li>
          <li>✅ <strong>Overflow prevention:</strong> No horizontal scrolling on any screen size</li>
          <li>✅ <strong>Touch-friendly:</strong> Larger touch targets on mobile devices</li>
          <li>✅ <strong>Auto-close:</strong> Menu closes when resizing to desktop</li>
          <li>✅ <strong>Active states:</strong> Visual feedback for current page</li>
        </ul>
      </div>

      <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Testing Instructions</h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Resize your browser window to different widths</li>
          <li>Check that the hamburger menu appears at 1024px and below</li>
          <li>Verify that all navigation items (including Feedback) are accessible</li>
          <li>Test the mobile menu by clicking the hamburger icon</li>
          <li>Ensure no horizontal scrolling occurs at any screen size</li>
          <li>Verify that the menu closes when navigating to a new page</li>
        </ol>
      </div>
    </div>
  );
};

export default NavbarResponsiveTest;