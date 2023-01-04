import PaymentService from "../modules/payment/services/payment.services";
import { handleStaleResponses } from "./handleStaleResponses";

export const JobHandlers = {
  completePayout: async (job, done) => {
    const {
      data: { theModel, lawyerInfo },
    } = job.attrs;
    await PaymentService.completePayout({ theModel, lawyerInfo });
    done();
  },

  staleResponses: async (job, done) => {
    handleStaleResponses();
    done();
  },
};
