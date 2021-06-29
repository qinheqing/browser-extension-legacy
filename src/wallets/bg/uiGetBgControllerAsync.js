import { getBackgroundInstanceAsync } from '../../../ui/app/store/actions';

async function uiGetBgControllerAsync() {
  // TODO check if is extension is locked
  return getBackgroundInstanceAsync();
}

export default uiGetBgControllerAsync;
