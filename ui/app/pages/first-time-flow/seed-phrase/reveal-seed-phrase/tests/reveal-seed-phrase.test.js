import assert from 'assert';
import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import RevealSeedPhrase from '..';

describe('Reveal Seed Phrase', function () {
  let wrapper;

  const TEST_SEED =
    'debris dizzy just program just float decrease vacant alarm reduce speak stadium';

  const props = {
    history: {
      push: sinon.spy(),
    },
    seedPhrase: TEST_SEED,
    setSeedPhraseBackedUp: sinon.spy(),
    setCompletedOnboarding: sinon.spy(),
  };

  beforeEach(function () {
    wrapper = mount(<RevealSeedPhrase.WrappedComponent {...props} />, {
      context: {
        t: (str) => str,
        trackEvent: () => undefined,
      },
    });
  });

  it('seed phrase', function () {
    const seedPhrase = wrapper.find(
      '.reveal-seed-phrase__secret-words--hidden',
    );
    assert.strictEqual(seedPhrase.length, 1);
    assert.strictEqual(seedPhrase.text(), TEST_SEED);
  });

  it('clicks to reveal', function () {
    const reveal = wrapper.find('.reveal-seed-phrase__secret-blocker');

    assert.strictEqual(wrapper.state().isShowingSeedPhrase, false);
    reveal.simulate('click');
    assert.strictEqual(wrapper.state().isShowingSeedPhrase, true);

    const showSeed = wrapper.find('.reveal-seed-phrase__secret-words');
    assert.strictEqual(showSeed.length, 1);
  });
});
