/**
 * CRACO config — swaps CRA 4's postcss-loader v3 (PostCSS 7) with
 * postcss-loader v4 (PostCSS 8) so Tailwind CSS 3 works correctly.
 */
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      function swapPostcssLoader(rules) {
        rules.forEach((rule) => {
          if (rule.oneOf) swapPostcssLoader(rule.oneOf);
          if (rule.use && Array.isArray(rule.use)) {
            rule.use = rule.use.map((use) => {
              const loader =
                typeof use === "string" ? use : use && use.loader;
              if (loader && loader.includes("postcss-loader")) {
                return {
                  loader: require.resolve("postcss-loader"),
                  options: {
                    postcssOptions: {
                      plugins: [
                        require("tailwindcss"),
                        require("autoprefixer"),
                      ],
                    },
                  },
                };
              }
              return use;
            });
          }
        });
      }
      swapPostcssLoader(webpackConfig.module.rules);
      return webpackConfig;
    },
  },
};
