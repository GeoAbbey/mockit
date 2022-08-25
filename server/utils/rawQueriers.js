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

  activities: () => {
    return `SELECT "PayIns"."createdAt", "PayIns".amount, "PayIns"."ticketId" as notes, "PayIns".for as service
    FROM "PayIns"
    UNION ALL
    SELECT "Transactions"."createdAt", "Transactions".amount, "Transactions".notes, "Transactions"."modelType" as service FROM "Transactions" WHERE "ownerId"=:id ORDER BY "createdAt" ASC limit :limit offset :offset;`;
  },
};
