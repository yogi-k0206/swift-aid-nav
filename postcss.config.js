import { createRequire } from "module";

const require = createRequire(import.meta.url);

const loadLocalPlugin = (name) => {
  try {
    const resolvedPath = require.resolve(name, { paths: [process.cwd()] });
    return require(resolvedPath);
  } catch {
    return require(name);
  }
};

export default {
  plugins: [loadLocalPlugin("tailwindcss"), loadLocalPlugin("autoprefixer")],
};
