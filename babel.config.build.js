// Build-only Babel config (referenced explicitly from the `build` script so it
// never affects Jest, which uses jest-expo's own transform).
//
// Why Babel and not just tsc: this library ships Reanimated worklets (gesture
// callbacks + useAnimatedStyle). A plain `tsc` build leaves the "worklet"
// directives as inert strings, so in a consumer app the worklets never get
// installed on the UI thread — gestures and animations silently no-op and the
// board renders read-only. Correctly-packaged Reanimated libraries (gesture
// handler, reanimated, moti) pre-compile their worklets for exactly this
// reason. `react-native-worklets/plugin` is pinned to the version the target
// app runs (0.10.x / Reanimated 4) so the compiled worklet format matches.
module.exports = {
  presets: [
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }]
  ],
  plugins: ["react-native-worklets/plugin"]
}
