require = require("esm")(module /*, options*/);

const { app, routes } = require("../app"); // The express app we just created
const port = parseInt(process.env.PORT, 10) || 8000;

app.listen(port, () => {
  console.log(`Zapp Lawyer Backend app  listening at http://localhost:${port}`);
  routes.forEach((route) => {
    console.log(`Routes configured for ${route.getName()}`);
  });
});
