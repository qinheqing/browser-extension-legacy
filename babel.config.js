module.exports = function (api) {
  api.cache(false);
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['chrome >= 63', 'firefox >= 68'],
          },
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // In contrast to MobX 4/5, "loose" must be false!
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],
  };
};
