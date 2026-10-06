import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/app';
import './ui/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
