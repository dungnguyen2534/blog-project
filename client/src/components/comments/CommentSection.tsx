import PostsAPI from "@/api/post";
import CommentList from "./CommentList";
import CommentsContextProvider from "@/context/CommentsContext";
import CommentCount from "./CommentCount";
import CreateCommentBox from "./CreateCommentBox";
import { cookies } from "next/headers";
import { Post } from "@/validation/schema/post";

interface CommentSectionProps {
  post: Post;
}

export default async function CommentSection({ post }: CommentSectionProps) {
  const postId = post._id;
  let initialPage;
  const userCookie = cookies().get("connect.sid");

  try {
    initialPage = await PostsAPI.getCommentList(
      postId,
      undefined,
      undefined,
      12,
      userCookie
    );
  } catch {
    initialPage = undefined;
  }

  let initialReplyPages;
  if (initialPage) {
    try {
      const replyPages = initialPage.comments.map(async (parentComment) => {
        const replyPage = await PostsAPI.getCommentList(
          postId,
          undefined,
          parentComment._id,
          6,
          userCookie
        );
        return replyPage;
      });

      initialReplyPages = await Promise.all(replyPages);
    } catch (error) {
      initialReplyPages = undefined;
    }
  }

  return (
    <CommentsContextProvider
      initialPage={initialPage}
      initialReplyPages={initialReplyPages}
      post={post}>
      <section className="rounded-t-none sm:py-5 p-3">
        <div className="max-w-prose mx-auto">
          <div className="mb-6">
            <div className="flex gap-1 text-2xl font-extrabold mb-4">
              <span>Comments</span>
              {<CommentCount />}
            </div>
            <CreateCommentBox postId={postId} />
          </div>
          <CommentList />
        </div>
      </section>
    </CommentsContextProvider>
  );
}
