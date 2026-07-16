// Lints the hand-written JS: files/*.js plus the inline <script> blocks
// inside the HTML pages (via eslint-plugin-html). Focused on correctness,
// not style — the site's ES5 idiom (var, function declarations) is intentional.
const js = require("@eslint/js");
const html = require("eslint-plugin-html");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "files/vendor/**", // third-party (p5.js)
      "QUESTION.html",   // Twine export — generated code
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.html"],
    plugins: { html },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        // browser
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        location: "readonly",
        history: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        addEventListener: "readonly",
        removeEventListener: "readonly",
        fetch: "readonly",
        URL: "readonly",
        Audio: "readonly",
        Image: "readonly",
        AudioContext: "readonly",
        webkitAudioContext: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        MutationObserver: "readonly",
        matchMedia: "readonly",
        getComputedStyle: "readonly",
        innerWidth: "readonly",
        innerHeight: "readonly",
        devicePixelRatio: "readonly",
        performance: "readonly",
        screen: "readonly",
        alert: "readonly",
        // libraries loaded via <script> tags
        p5: "readonly",
        dataLayer: "writable",
      },
    },
    rules: {
      // the site's pages intentionally define/use vars across <script> blocks
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none" }],
      // creative code leans on things like `while (true)` with breaks
      "no-constant-condition": ["error", { checkLoops: false }],
      // `try { localStorage... } catch (e) {}` is deliberate (private mode)
      "no-empty": ["error", { allowEmptyCatch: true }],
      // ES5 idiom used throughout: `for (var i = ...)` re-declared per loop
      // within the same function scope. Harmless with var hoisting.
      "no-redeclare": "off",
    },
  },
  {
    // the config file itself runs in Node (CommonJS)
    files: ["eslint.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
      },
    },
  },
];
