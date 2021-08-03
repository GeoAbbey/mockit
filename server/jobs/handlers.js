import PayoutsService from "../modules/payout/services/payout.services";

export const JobHandlers = {
  createPayout: async (job, done) => {
    const { data } = job.attrs;
    await PayoutsService.create(data);
    done();
  },
};
