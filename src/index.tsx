import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';

import './style.css';
import './firebase';

import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App/ >);
