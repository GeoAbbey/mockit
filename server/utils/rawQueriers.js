export const rawQueries = {
  statistics: (modelType) => {
    return `SELECT status, COUNT(*) FROM "${modelType}" GROUP BY status`;
  },
};
