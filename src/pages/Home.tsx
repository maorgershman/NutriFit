import { useEffect } from 'react';

import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';

const fbAuth = getAuth();
export const Home = () => {
  useEffect(() => {
    console.log('Home mounted');
  }, []);
  
  return (
    <>
      <div>
        <Link to={'/foods'}>
          Foods
        </Link>
      </div>
    </>
  );
}