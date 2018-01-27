module.exports = function(wallaby) {
  return {
    debug: true,

    env: {
      type: "node",
      runner: "node",
    },

    testFramework: "jest",

    files: ["tsconfig.json", "org/**/*.ts?(x)", "danger/**/*.ts?(x)", "tasks/**/*.ts?(x)"],

    tests: ["tests/*.test.ts?(x)"],
  }
}
