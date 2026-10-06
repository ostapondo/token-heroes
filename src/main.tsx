import { connectHost, LogLevel } from '@platform';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/app/app';
import './ui/global.css';

const host = connectHost();

window.addEventListener('error', (event) => {
  host.log(LogLevel.Error, `Uncaught: ${event.message} at ${event.filename}:${event.lineno}`);
});
window.addEventListener('unhandledrejection', (event) => {
  host.log(LogLevel.Error, `Unhandled rejection: ${String(event.reason)}`);
});

const root = document.getElementById('root');

if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <App host={host} />
  </StrictMode>,
);
