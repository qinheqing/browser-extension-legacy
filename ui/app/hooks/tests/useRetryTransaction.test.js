import assert from 'assert';
import * as reactRedux from 'react-redux';
import { renderHook } from '@testing-library/react-hooks';
import sinon from 'sinon';
import transactions from '../../../../test/data/transaction-data.json';
import * as methodDataHook from '../useMethodData';
import * as trackEventHook from '../useTrackEvent';
import { showSidebar } from '../../store/actions';
import { useRetryTransaction } from '../useRetryTransaction';

describe('useRetryTransaction', function () {
  describe('when transaction meets retry enabled criteria', function () {
    const dispatch = sinon.spy(() => Promise.resolve({ blockTime: 0 }));
    const trackEvent = sinon.spy();
    const event = {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
    };

    before(function () {
      sinon.stub(reactRedux, 'useDispatch').returns(dispatch);
      sinon.stub(methodDataHook, 'useMethodData').returns({});
      sinon.stub(trackEventHook, 'useTrackEvent').returns(trackEvent);
    });

    afterEach(function () {
      dispatch.resetHistory();
      trackEvent.resetHistory();
    });
    const retryEnabledTransaction = {
      ...transactions[0],
      transactions: [
        {
          submittedTime: new Date() - 5001,
        },
      ],
      hasRetried: false,
    };

    it('retryTransaction function should track metrics', function () {
      const { result } = renderHook(() =>
        useRetryTransaction(retryEnabledTransaction, true),
      );
      const retry = result.current;
      retry(event);
      assert.strictEqual(trackEvent.calledOnce, true);
    });

    it('retryTransaction function should show retry sidebar', async function () {
      const { result } = renderHook(() =>
        useRetryTransaction(retryEnabledTransaction, true),
      );
      const retry = result.current;
      await retry(event);
      assert.strictEqual(
        dispatch.calledWith(
          showSidebar({
            transitionName: 'sidebar-left',
            type: 'customize-gas',
            props: { transaction: retryEnabledTransaction.initialTransaction },
          }),
        ),
        true,
      );
    });

    after(function () {
      sinon.restore();
    });
  });
});
