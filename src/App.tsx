import { Outlet } from 'react-router-dom';

import { ContextProvider } from './Context';
import { Router } from './Router';

import { Navbar } from './components/Navbar';
import { Main } from './components/Main';
import { useAuthState } from './hooks/useAuthState';

const AppAfterLoadingAuth = () => {
  return (
    <>
      <Navbar />
      <Main>
        <Outlet />
      </Main>
    </>
  );
}

const App = () => {
  const isAuthStateDetermined = useAuthState();
  if (!isAuthStateDetermined) {
    return null;
  }

  return <AppAfterLoadingAuth />;
}

export const Root = () => {
  return (
    <ContextProvider>
      <Router app={<App />} />
    </ContextProvider>
  );
}
