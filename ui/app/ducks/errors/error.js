import * as actionConstants from '../../store/actionConstants';

const initState = {
  list: [],
};

export default function reducer(state = initState, action = {}) {
  if (
    action.type === actionConstants.DISPLAY_WARNING ||
    action.type === actionConstants.UNLOCK_FAILED ||
    action.type === actionConstants.TRANSACTION_ERROR
  ) {
    const message = action.value;
    return {
      ...state,
      list: [
        ...state.list,
        {
          type: action.type,
          message,
        },
      ],
    };
  }
  return state;
}
