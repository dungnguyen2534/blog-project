import PostsList from "@/components/posts/PostList";

export default async function Home() {
  return (
    <main className="p-3 sm:container sm:py-4">
      <PostsList />
    </main>
  );
}
