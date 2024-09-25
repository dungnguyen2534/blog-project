import PostsAPI from "@/api/post";
import CommentList from "./CommentList";
import CreateCommentBox from "./CreateCommentBox";
import CommentsContextProvider from "@/context/CommentsContext";
import CommentCount from "./CommentCount";

interface CommentSectionProps {
  postId: string;
}

export default async function CommentSection({ postId }: CommentSectionProps) {
  const initialPage = await PostsAPI.getCommentList(postId);

  return (
    <CommentsContextProvider initialPage={initialPage} postId={postId}>
      <section className="mt-10 rounded-t-none sm:py-7 p-3 border-t-[1px]">
        <div className="max-w-prose mx-auto">
          <div className="mb-6">
            <div className="text-2xl font-extrabold mb-4">
              Comments{" "}
              {<CommentCount initialCount={initialPage.totalComments} />}
            </div>
            <CreateCommentBox postId={postId} />
          </div>
          <CommentList initialPage={initialPage} />
        </div>
      </section>
    </CommentsContextProvider>
  );
}
