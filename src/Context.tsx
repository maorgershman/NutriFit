import { createContext, ReactNode, useState } from 'react';

export type IContext = {
  auth?: AuthState | null, // undefined = not determined, null = not connected
  setAuth: StateDispatcher<AuthState | undefined | null>,
}

export type AuthState = {
  uid: string,
  profilePictureURL: string,
};

export const Context = createContext<IContext>({
  setAuth: () => {},
});

export const ContextProvider = (props: {
  children: ReactNode,
}) => {
  const { children } = props;

  const [auth, setAuth] = useState<AuthState | null>();

  return (
    <Context.Provider 
      value={{ 
        auth, setAuth,
      }}
    >
      {children}
    </Context.Provider>
  );
}