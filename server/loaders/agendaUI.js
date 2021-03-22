import basicAuth from "express-basic-auth";
import agendaDash from "agendash";

export const agendaUI = (app, agendaInstance) => {
  app.use(
    "/agenda-dashboard",
    basicAuth({
      users: {
        agendaJsAdmin: process.env.SECRET_KEY,
      },
      challenge: true,
    }),
    agendaDash(agendaInstance)
  );
};
