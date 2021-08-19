import PaymentService from "../modules/payment/services/payment.services";

export const JobHandlers = {
  completePayout: async (job, done) => {
    const { data } = job.attrs;
    await PaymentService.completePayout(data);
    done();
  },
};
