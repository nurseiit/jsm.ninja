const daysBetweenDates = (from: Date, to: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  return Math.round(Math.abs((to.getTime() - from.getTime()) / oneDay));
};

export default daysBetweenDates;
