import Vapi from '@vapi-ai/web';
import { CallStatus } from '../types';

export class VapiService {
  private vapi: any = null;
  
  // Callbacks
  private onStatusChange: ((status: CallStatus) => void) | null = null;
  private onVolumeChange: ((volume: number) => void) | null = null;
  private onError: ((error: any) => void) | null = null;

  public initialize(
    onStatusChange: (status: CallStatus) => void,
    onVolumeChange: (volume: number) => void,
    onError: (error: any) => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onVolumeChange = onVolumeChange;
    this.onError = onError;

    return () => {
      this.stop();
      this.vapi = null;
    };
  }

  public async start(publicKey: string, assistantId: string) {
    if (!publicKey || !assistantId) {
       this.onError?.(new Error("Missing Public Key or Assistant ID"));
       return;
    }

    // Clean up existing instance if any
    if (this.vapi) {
      this.vapi.stop();
      this.vapi.removeAllListeners();
    }

    try {
      this.onStatusChange?.('connecting');
      
      // Initialize Vapi with the provided public key
      // @ts-ignore
      this.vapi = new Vapi(publicKey);

      // Attach event listeners to the new instance
      this.attachListeners();

      // Start the call
      await this.vapi.start(assistantId);
      
    } catch (e) {
      console.error("Failed to start Vapi session:", e);
      this.onError?.(e);
      this.onStatusChange?.('disconnected');
    }
  }

  public stop() {
    if (this.vapi) {
      this.vapi.stop();
    }
  }

  private attachListeners() {
    if (!this.vapi) return;

    this.vapi.on('call-start', () => {
      console.log('Vapi: Call started');
      this.onStatusChange?.('connected');
    });

    this.vapi.on('call-end', () => {
      console.log('Vapi: Call ended');
      this.onStatusChange?.('disconnected');
    });

    this.vapi.on('volume-level', (volume: number) => {
      this.onVolumeChange?.(volume);
    });

    this.vapi.on('error', (e: any) => {
      console.error('Vapi: Error event', e);
      this.onError?.(e);
      // Ensure status is reset on error
      this.onStatusChange?.('disconnected');
    });
    
    // Log other events for debugging
    this.vapi.on('message', (msg: any) => console.log('Vapi: Message', msg));
  }
}