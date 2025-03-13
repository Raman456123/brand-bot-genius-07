
import { AIState } from './types';

export interface AIBrainInterface {
  loadState(): Promise<void>;
  saveState(): Promise<void>;
  getState(): AIState;
}
