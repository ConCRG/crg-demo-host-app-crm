import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CRGProvider } from '@crg/connector-react'
import { mountSidecarUI, mountAssistUI } from '@crg/sidecar-ui'
import { CRGToolbar } from '@crg/connector-react-v2'
import './index.css'
import App from './App.tsx'

const crgEnabled = import.meta.env.VITE_CRG_ENABLED === 'true';

const config = {
  appId: 'crm-demo',
  serviceUrl: import.meta.env.VITE_CRG_SERVICE_URL ?? 'http://localhost:3002',
  graphServiceUrl: import.meta.env.VITE_CRG_GRAPH_SERVICE_URL ?? 'http://localhost:8002',
  sourceCodePath: import.meta.env.VITE_CRG_SOURCE_CODE_PATH,
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

const toolbarConfig = {
  appId: 'crm-demo',
  graphServiceUrl: import.meta.env.VITE_CRG_GRAPH_SERVICE_URL ?? 'http://localhost:8002',
  userRole: 'admin',
  userId: 'demo-user-001',
  position: {
    pill: 'bottom-right' as const,
    commandBar: 'center' as const,
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
        <CRGToolbar config={toolbarConfig} />
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
