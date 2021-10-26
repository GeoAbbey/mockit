export const rawQueries = {
  statistics: (modelType) => {
    return `SELECT status, COUNT(*) FROM "${modelType}" GROUP BY status`;
  },
  noOfDistinctUsers: () => {
    return `SELECT role, COUNT(*) FROM "Users" WHERE "Users"."isVerified"=true GROUP BY role`;
  },
};
