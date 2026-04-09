declare module '@crg/connector-react' {
  import type { ReactNode } from 'react';
  import type { MessageBus, CRGConfig } from '@crg/connector-core';

  type SidecarMountFn = (
    container: HTMLElement,
    messageBus: MessageBus,
    config: CRGConfig,
  ) => void;

  interface CRGProviderProps {
    config: CRGConfig;
    children: ReactNode;
    mountTrainUI?: SidecarMountFn;
    mountAssistUI?: SidecarMountFn;
  }

  export function CRGProvider(props: CRGProviderProps): ReactNode;
  export function useCRG(): unknown;
}

declare module '@crg/sidecar-ui' {
  import type { MessageBus } from '@crg/connector-core';

  export function mountSidecarUI(
    container: HTMLElement,
    messageBus: MessageBus,
    config: { graphServiceUrl?: string; appId?: string },
  ): void;

  export function unmountSidecarUI(container: HTMLElement): void;

  export function mountAssistUI(
    container: HTMLElement,
    messageBus: MessageBus,
    config: {
      appId: string;
      serviceUrl: string;
      graphServiceUrl: string;
      userRole?: string;
      userId?: string;
    },
  ): void;

  export function unmountAssistUI(container: HTMLElement): void;
}
