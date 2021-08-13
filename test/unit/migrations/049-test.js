import assert from 'assert';
import migration49 from '../../../app/scripts/migrations/049';

describe('migration #49', function () {
  it('should update the version metadata', async function () {
    const oldStorage = {
      meta: {
        version: 48,
      },
      data: {},
    };

    const newStorage = await migration49.migrate(oldStorage);
    assert.deepStrictEqual(newStorage.meta, {
      version: 49,
    });
  });

  it('should move metaMetricsId to MetaMetricsController', async function () {
    const oldStorage = {
      meta: {},
      data: {
        PreferencesController: {
          bar: 'baz',
        },
        foo: 'bar',
      },
    };

    const newStorage = await migration49.migrate(oldStorage);
    assert.deepStrictEqual(newStorage.data, {
      PreferencesController: {
        bar: 'baz',
      },
      foo: 'bar',
    });
  });

  it('should move participateInMetaMetrics to MetaMetricsController', async function () {
    const oldStorage = {
      meta: {},
      data: {
        PreferencesController: {
          bar: 'baz',
        },
        foo: 'bar',
      },
    };

    const newStorage = await migration49.migrate(oldStorage);
    assert.deepStrictEqual(newStorage.data, {
      PreferencesController: {
        bar: 'baz',
      },
      foo: 'bar',
    });
  });

  it('should move metaMetricsSendCount to MetaMetricsController', async function () {
    const oldStorage = {
      meta: {},
      data: {
        PreferencesController: {
          bar: 'baz',
        },
        foo: 'bar',
      },
    };

    const newStorage = await migration49.migrate(oldStorage);
    assert.deepStrictEqual(newStorage.data, {
      PreferencesController: {
        bar: 'baz',
      },
      foo: 'bar',
    });
  });

  it('should move all metaMetrics fields to MetaMetricsController', async function () {
    const oldStorage = {
      meta: {},
      data: {
        PreferencesController: {
          bar: 'baz',
        },
        foo: 'bar',
      },
    };

    const newStorage = await migration49.migrate(oldStorage);
    assert.deepStrictEqual(newStorage.data, {
      PreferencesController: {
        bar: 'baz',
      },
      foo: 'bar',
    });
  });

  it('should do nothing if no PreferencesController key', async function () {
    const oldStorage = {
      meta: {},
      data: {
        foo: 'bar',
      },
    };

    const newStorage = await migration49.migrate(oldStorage);
    assert.deepStrictEqual(newStorage.data, {
      foo: 'bar',
    });
  });
});
