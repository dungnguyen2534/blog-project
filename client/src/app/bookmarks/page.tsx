import BookmarkList from "./BookmarkList";
import { cookies } from "next/headers";
import BookmarkSearch from "./BookmarkSearch";

interface BookmarksPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  const searchQuery = searchParams.searchQuery as string;

  return (
    <main className="secondary-container px-0 md:px-8 mt-[4rem] md:!mt-[4.7rem] !bg-transparent">
      <div className="px-3 md:px-0 secondary-container py-1 mb-1 md:py-0 md:mb-0 md:!bg-transparent rounded-none">
        <div className="flex justify-between items-center gap-5 [&>*]:flex-grow [&>*]:md:flex-grow-0">
          <h1 className="text-2xl md:text-3xl font-bold">Bookmarks</h1>

          <BookmarkSearch
            searchQuery={searchQuery}
            className="hidden md:block w-1/2"
          />
        </div>
        <BookmarkSearch
          searchQuery={searchQuery}
          className="my-2 block md:hidden"
        />
      </div>

      <hr className="hidden md:block md:my-3" />
      <BookmarkList searchQuery={searchQuery} />
    </main>
  );
}
