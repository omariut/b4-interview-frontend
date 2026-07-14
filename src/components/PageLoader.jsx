import React from 'react';



function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'transparent'
    }}>
      <style>
        {`
          @keyframes customSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      
      <div style={{
        width: '38px',
        height: '38px',
        border: '3.5px solid #38bdf8', 
        borderBottomColor: 'transparent', 
        borderRightColor: 'transparent',  
        borderRadius: '50%',
        animation: 'customSpin 0.75s linear infinite'
      }} />
    </div>
  );
}

export default PageLoader