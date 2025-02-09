import whoj from '@whoj/eslint-config';

export default whoj({
  vue: true,
  type: 'lib',
  nuxt: {
    features: {
      tooling: true
    },
    dirs: {
      src: [
        './playground'
      ]
    }
  }
});
