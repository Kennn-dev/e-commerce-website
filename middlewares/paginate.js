const getPaginate = async (req, res, next) => {
  const { limit, page } = await req.body.query;
  if (!limit || !page) next();
  req.paginate = {
    limit,
    page,
  };
  next();
};

module.exports = {
  getPaginate,
};
