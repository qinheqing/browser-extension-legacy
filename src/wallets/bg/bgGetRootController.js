import assert from 'assert';
import backgroundContainer from '../../../app/scripts/backgroundContainer';

function bgGetRootController({ unlockRequired = true } = {}) {
  const controller = backgroundContainer.getRootController();

  if (unlockRequired) {
    assert(
      controller.getState().isUnlocked,
      'You should unlock the extension first.',
    );
  }

  return controller;
}

export default bgGetRootController;
