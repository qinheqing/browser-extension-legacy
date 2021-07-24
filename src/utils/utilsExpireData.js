import { CONST_DURATIONS } from '../consts/consts';

const EXPIRE_DURATIONS = {
  tokenPrice: {
    expire: CONST_DURATIONS.HOUR,
    dead: CONST_DURATIONS.MONTH,
  },
  tokenMeta: {
    expire: CONST_DURATIONS.WEEK,
    dead: CONST_DURATIONS.MONTH,
  },
  tokenBalance: {
    expire: CONST_DURATIONS.MIN,
    dead: CONST_DURATIONS.MONTH,
  },
};

function isExpired() {
  //
}

function isDead() {
  //
}

function isAlive() {
  //
}

export default {
  isAlive,
  isExpired,
  isDead,
};
