export class CommonRoutesConfig {
  app;
  name;
  path;
  constructor({ app, name, path }) {
    this.app = app;
    this.name = name;
    this.path = path;
    this.configureRoutes();
  }

  getName() {
    return this.name;
  }

  configureRoutes() {}
}
