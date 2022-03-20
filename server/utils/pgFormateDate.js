export const pgDateFormate = (theDate) =>
  new Date(theDate).toISOString().replace("T", " ").replace("Z", "");
