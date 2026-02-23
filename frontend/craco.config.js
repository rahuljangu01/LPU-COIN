module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // यह लाइन उन जिद्दी वॉर्निंग्स को फिल्टर कर देगी
      webpackConfig.ignoreWarnings = [
        {
          module: /@vladmandic\/face-api/,
        },
        {
          message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
        },
      ];
      return webpackConfig;
    },
  },
};