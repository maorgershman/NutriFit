import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <>
      <div>
        <Link to={'/foods'}>
          Foods
        </Link>
      </div>
      <div>
        <Link to={'/meals'}>
          Meals
        </Link>
      </div>
    </>
  );
}