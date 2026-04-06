import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CRGProvider } from '@crg/connector-react'
import { mountSidecarUI, mountAssistUI } from '@crg/sidecar-ui'
import './index.css'
import App from './App.tsx'
import { useRoleStore } from './contexts/RoleContext.tsx'
import { useAuthStore } from './contexts/AuthContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

const crgEnabled = import.meta.env.VITE_CRG_ENABLED === 'true';

const baseConfig = {
  appId: 'crm-demo',
  serviceUrl: import.meta.env.VITE_CRG_SERVICE_URL ?? 'http://localhost:3001',
  graphServiceUrl: import.meta.env.VITE_CRG_GRAPH_SERVICE_URL ?? 'http://localhost:8002',
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
  const role = useRoleStore((s) => s.role);
  const authUser = useAuthStore((s) => s.user);

  const config = {
    ...baseConfig,
    userId: authUser?.id ?? 'demo-user-001',
    userRole: role,
  };

  if (crgEnabled) {
    return (
      <StrictMode>
        <ThemeProvider>
          <CRGProvider
            config={config}
            mountTrainUI={(container, bus) => mountSidecarUI(container, bus, config)}
            mountAssistUI={(container, bus) => mountAssistUI(container, bus, config)}
          >
            <App />
          </CRGProvider>
        </ThemeProvider>
      </StrictMode>
    );
  }

  return (
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />)
