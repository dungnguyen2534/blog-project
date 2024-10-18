import TagSelector from "@/app/bookmarks/TagSelector";
import { Input } from "@/components/ui/input";
import BookmarkList from "./BookmarkList";
import PostsContextProvider from "@/context/PostsContext";
import PostsAPI from "@/api/post";
import { cookies } from "next/headers";

interface BookmarksPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  const tag = searchParams.tag as string;
  const userCookie = cookies().get("connect.sid");

  let tagList: string[] | undefined;
  try {
    tagList = (await PostsAPI.getSavedTags(userCookie)).map((tag) =>
      tag.startsWith("#") ? tag.slice(1) : tag
    );
  } catch {
    tagList = undefined;
  }

  return (
    <PostsContextProvider saved tag={tag} tagList={tagList}>
      <main className="secondary-container px-0 md:px-8 my-[0.35rem] md:my-2 !bg-transparent">
        <div className="px-3 md:px-0">
          <div className="flex justify-between items-center gap-5 [&>*]:flex-grow [&>*]:md:flex-grow-0">
            <h1 className="text-2xl md:text-3xl font-bold">Bookmarks</h1>
            <div className="flex gap-3 w-[35%] md:w-[65%]">
              <Input placeholder="Search..." className="hidden md:block" />
              <TagSelector placeholder="Filter by tag" />
            </div>
          </div>
          <Input placeholder="Search..." className="block md:hidden my-2" />
        </div>

        <hr className="hidden md:block md:my-3" />

        <BookmarkList tag={tag} />
      </main>
    </PostsContextProvider>
  );
}
