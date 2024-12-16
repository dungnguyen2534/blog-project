import { OK } from "../constant/httpCode";
import { quickSearchHandler } from "../services/search.service";
import catchErrors from "../utils/catchErrors";
import { quickSearchQuerySchema } from "../validation/request/search.request";

export const quickSearch = catchErrors(async (req, res) => {
  const requestQuery = quickSearchQuerySchema.parse(req.query);

  const data = await quickSearchHandler(requestQuery);
  res.status(OK).json(data);
});
