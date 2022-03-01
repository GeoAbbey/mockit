export const paginate = (filter) => {
  const { page = 1, pageSize = 10 } = filter;
  const offset = (parseInt(page) - 1) * pageSize;
  const limit = parseInt(pageSize);

  return {
    offset,
    limit,
  };
};
