import { useEffect } from 'react';

import { getAuth } from 'firebase/auth';

const fbAuth = getAuth();
export const Home = () => {
  useEffect(() => {
    console.log('Home mounted');
  }, []);
  
  return (
    <>
      <div
        className='container flex'
        style={{
          alignItems: 'center'
        }}
      >
        
      </div>
    </>
  );
}