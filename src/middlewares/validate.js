export const validate = ({ body, query, params }) => (req, res, next) => {
  if (body) req.body = body.parse(req.body);
  if (query) req.query = query.parse(req.query);
  if (params) req.params = params.parse(req.params);
  next();
};
