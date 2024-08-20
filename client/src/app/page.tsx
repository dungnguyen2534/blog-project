import PostsList from "@/components/posts/PostList";

export default async function Home() {
  return (
    <main className="container px-2 sm:px-8 my-[1.05rem]">
      <PostsList />
    </main>
  );
}
