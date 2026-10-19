import type { ReactElement } from 'react';
export interface PontoModuleProps {
  accountId?: string;
  userId?: string;
  getAccessToken?: () => Promise<string | null>;
  onChromeChange: (chrome: any) => void;
  onOpenGeneralSettings: () => void;
  standaloneShell?: boolean;
}
export declare function PontoModule(props: PontoModuleProps): ReactElement;
export declare const PONTO_MODULE_VERSION: '0.2.0';
