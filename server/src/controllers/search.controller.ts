import { OK } from "../constant/httpCode";
import { searchHandler } from "../services/search.service";
import catchErrors from "../utils/catchErrors";
import { searchQuerySchema } from "../validation/request/search.request";

export const search = catchErrors(async (req, res) => {
  const requestQuery = searchQuerySchema.parse(req.query);

  const data = await searchHandler(requestQuery);
  res.status(OK).json(data);
});
