import assert from 'assert';

let rootController = null;

function setRootController(controller) {
  rootController = controller;
}

function getRootController() {
  assert.ok(
    rootController,
    `rootController not exists, make sure this code is running by [background.js], and setRootController() has been called.`,
  );

  return rootController;
}

export default {
  setRootController,
  getRootController,
};
