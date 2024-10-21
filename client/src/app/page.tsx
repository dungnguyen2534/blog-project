import ArticlesAPI from "@/api/article";
import ArticleList from "@/components/articles/ArticleList";
import ArticleListTabs from "@/components/articles/ArticleListTabs";
import ArticlesContextProvider from "@/context/ArticlesContext";
import { cookies } from "next/headers";
import { IoIosCodeWorking } from "react-icons/io";

export default async function Home() {
  const userCookie = cookies().get("connect.sid");
  let initialPage;
  try {
    initialPage = await ArticlesAPI.getArticleList("/articles", userCookie);
  } catch {
    initialPage = undefined;
  }

  return (
    <ArticlesContextProvider initialPage={initialPage}>
      <div className="container px-0 md:px-8 my-[0.35rem] md:my-2">
        <ArticleListTabs defaultValue="Latest">
          <div className="relative hidden md:flex items-center">
            <h1 className="text-2xl font-semibold">Latest articles</h1>
            <div className="ml-auto flex gap-2">
              <IoIosCodeWorking size={30} />
              <IoIosCodeWorking size={30} />
              <IoIosCodeWorking size={30} />
            </div>
          </div>
          <hr className="mb-2 hidden md:block" />
          <ArticleList key={"latest-articles"} />
        </ArticleListTabs>
      </div>
    </ArticlesContextProvider>
  );
}
