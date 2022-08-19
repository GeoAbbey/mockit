export const rawQueries = {
  statistics: (modelType) => {
    return `SELECT status, COUNT(*) FROM "${modelType}" GROUP BY status`;
  },
  noOfDistinctUsers: () => {
    return `SELECT role, COUNT(*) FROM "Users" GROUP BY role`;
  },

  noOfActiveUsers: () => {
    return `SELECT role, COUNT(*) FROM "Users" where "Users".settings @> '{"isEmailVerified":true}' AND "Users".settings @> '{"isPhone":{"verified": true}}' GROUP BY role`;
  },
};
