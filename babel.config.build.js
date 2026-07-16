// Build-only Babel config (referenced explicitly from the `build` script so it
// never affects Jest, which uses jest-expo's own transform).
//
// Babel here only strips TypeScript and compiles JSX. It must NOT run
// `react-native-worklets/plugin`: pre-compiled worklets embed the plugin's
// serialization format, which must match the `react-native-worklets` runtime
// version in the CONSUMER app (0.5.x on Reanimated 4.0/4.1, 0.10.x on 4.4+).
// Shipping baked worklets from one version crashes apps on any other with
// "Mismatch between JavaScript code version and Worklets Babel plugin
// version". Instead we ship inert `"worklet"` directives (Babel preserves
// directive prologues) and un-workletized `useAnimatedStyle`/gesture
// callbacks; Metro applies the app's own Babel config — including its
// matching worklets plugin — to node_modules, so worklets are compiled
// against exactly the runtime the app ships. This is how gesture-handler,
// moti, etc. package theirs.
//
// (Historical note: 0.1.2 added the plugin here to fix a "read-only board";
// the real cause turned out to be the gesture-layer absolute-fill collapse
// fixed in 0.1.3, so pre-compiling was never the necessary part.)
module.exports = {
  presets: [
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
