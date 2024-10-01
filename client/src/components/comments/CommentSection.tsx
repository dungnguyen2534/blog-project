import PostsAPI from "@/api/post";
import CommentList from "./CommentList";
import CommentsContextProvider from "@/context/CommentsContext";
import CommentCount from "./CommentCount";
import CreateCommentBox from "./CreateCommentBox";
import { CommentPage } from "@/validation/schema/post";

interface CommentSectionProps {
  postId: string;
}

export default async function CommentSection({ postId }: CommentSectionProps) {
  const initialPage = await PostsAPI.getCommentList(postId);

  let initialReplyPages: CommentPage[];
  const replyPages = initialPage.comments.map(async (comment) => {
    const replyPage = await PostsAPI.getCommentList(
      postId,
      undefined,
      comment._id
    );
    return replyPage;
  });

  initialReplyPages = await Promise.all(replyPages);

  return (
    <CommentsContextProvider
      initialPage={initialPage}
      initialReplyPages={initialReplyPages}
      postId={postId}>
      <section
        id="comment"
        className="mt-10 rounded-t-none sm:py-7 p-3 border-t-[1px]">
        <div className="max-w-prose mx-auto">
          <div className="mb-6">
            <div className="flex gap-1 text-2xl font-extrabold mb-4">
              <span>Comments</span>
              {<CommentCount />}
            </div>
            <CreateCommentBox postId={postId} />
          </div>
          <CommentList initialPage={initialPage} />
        </div>
      </section>
    </CommentsContextProvider>
  );
}
