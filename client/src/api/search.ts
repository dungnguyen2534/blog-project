import http from "@/lib/http";
import { QuickSearchData } from "@/validation/schema/search";

const SearchAPI = {
  search: async (searchQuery: string) => {
    const res = await http.post<QuickSearchData>(
      "/search?searchQuery=" + searchQuery
    );
    return res.payload;
  },
};

export default SearchAPI;
