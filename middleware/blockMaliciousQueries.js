const bleckMaliciousQueries = () => (req, res, next) => {
  // todo: query cost analysis
  // may be unneeded
  next();
};

export default bleckMaliciousQueries;
