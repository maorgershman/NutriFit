import { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Foods } from './pages/Foods';
import { Meals } from './pages/Meals';

export const Router = (props: {
  app: ReactNode,
}) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={props.app}>
          <Route index element={<Home />} />

          <Route path='login' element={<Login />} />
          <Route path='foods' element={<Foods />} />
          <Route path='meals' element={<Meals />} />
          
          <Route path='*' element={<Navigate replace to='/' />} />
        </Route>
      </Routes> 
    </BrowserRouter>
  );
}