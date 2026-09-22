declare module 'html5-qrcode' {
  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: {
        fps?: number;
        qrbox?: number | { width: number; height: number };
        aspectRatio?: number;
        disableFlip?: boolean;
        rememberLastUsedCamera?: boolean;
        [key: string]: any;
      },
      verbose?: boolean
    );

    render(
      qrCodeSuccessCallback: (decodedText: string, result: any) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): void;

    clear(): Promise<void>;
  }

  export class Html5Qrcode {
    constructor(elementId: string, config?: any);
    start(
      cameraIdOrConfig: any,
      configuration: any,
      qrCodeSuccessCallback: (decodedText: string, result: any) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): Promise<null>;
    stop(): Promise<void>;
    clear(): void;
  }
}
