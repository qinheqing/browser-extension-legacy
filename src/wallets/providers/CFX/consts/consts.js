import { format } from 'js-conflux-sdk';

// epochNumber='latest_state'
// format.epochNumber.$or(undefined)(epochNumber),
export const CFX_EPOCH_TAG = format.epochNumber.$or(undefined)('latest_state');
