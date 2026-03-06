import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CRGProvider } from '@crg/connector-react'
import { mountSidecarUI, mountAssistUI } from '@crg/sidecar-ui'
import './index.css'
import App from './App.tsx'

const crgEnabled = import.meta.env.VITE_CRG_ENABLED === 'true';

const config = {
  appId: 'crm-demo',
  serviceUrl: import.meta.env.VITE_CRG_SERVICE_URL ?? 'http://localhost:3001',
  graphServiceUrl: import.meta.env.VITE_CRG_GRAPH_SERVICE_URL ?? 'http://localhost:8002',
  userRole: 'admin',
  userId: 'demo-user-001',
  backgroundCapture: {
    enabled: true,
    debounceMs: 1000,
    mutationThreshold: 10,
    includeScreenshots: false,
    syncStrategy: 'immediate' as const,
    minRecaptureIntervalMs: 10000,
    enableContentHashing: true,
  },
};

function Root() {
  if (crgEnabled) {
    return (
      <StrictMode>
        <CRGProvider 
          config={config} 
          mountTrainUI={(container, bus) => mountSidecarUI(container, bus, config)}
          mountAssistUI={(container, bus) => mountAssistUI(container, bus, config)}
        >
          <App />
        </CRGProvider>
      </StrictMode>
    );
  }

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />)
