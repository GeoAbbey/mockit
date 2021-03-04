import expressLoader from "./express";

const init = async ({ app }) => {
  return expressLoader({ app });
};

export default { init };
