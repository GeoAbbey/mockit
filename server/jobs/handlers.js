import PaymentService from "../modules/payment/services/payment.services";

export const JobHandlers = {
  completePayout: async (job, done) => {
    const {
      data: { theModel, lawyerInfo },
    } = job.attrs;
    await PaymentService.completePayout({ theModel, lawyerInfo });
    done();
  },
};
