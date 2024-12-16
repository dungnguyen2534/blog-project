import ArticleList from "@/components/articles/ArticleList";
import ArticleListTabs from "@/components/articles/ArticleListTabs";
import { IoIosCodeWorking } from "react-icons/io";

export default function Home() {
  return (
    <main className="container px-0 md:px-8 mt-[4.3rem] md:!mt-[5.3rem]">
      <ArticleListTabs defaultValue="Latest">
        <div className="relative hidden md:flex items-center">
          <h1 className="text-2xl font-semibold">Latest articles</h1>
          <div className="ml-auto flex gap-2 text-neutral-500 dark:text-neutral-400">
            <IoIosCodeWorking size={30} />
            <IoIosCodeWorking size={30} />
            <IoIosCodeWorking size={30} />
          </div>
        </div>
        <hr className="mb-2 hidden md:block" />
        <ArticleList key={"latest-articles"} />
      </ArticleListTabs>
    </main>
  );
}
