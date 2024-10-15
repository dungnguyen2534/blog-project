import PostsAPI from "@/api/post";
import CommentList from "./CommentList";
import CommentsContextProvider from "@/context/CommentsContext";
import CommentCount from "./CommentCount";
import CreateCommentBox from "./CreateCommentBox";
import { CommentPage, Post } from "@/validation/schema/post";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cache } from "react";

interface CommentSectionProps {
  post: Post;
  userCookie?: RequestCookie;
}

const fetchComments = cache(
  async (postId: string, userCookie?: RequestCookie) => {
    try {
      const initialPage = await PostsAPI.getCommentList(
        postId,
        `posts/${postId}/comments?limit=12`,
        undefined,
        12,
        userCookie
      );
      const replyPages = initialPage.comments.map(async (parentComment) => {
        if (parentComment.replyCount === 0)
          return {
            comments: [],
            lastCommentReached: true,
            totalComments: 0,
          };

        const replyPage = await PostsAPI.getCommentList(
          postId,
          undefined,
          parentComment._id,
          6,
          userCookie
        );
        return replyPage;
      });
      const initialReplyPages = await Promise.all(replyPages);
      return { initialPage, initialReplyPages };
    } catch {
      return { initialPage: undefined, initialReplyPages: undefined };
    }
  }
);

export default async function CommentSection({
  post,
  userCookie,
}: CommentSectionProps) {
  const postId = post._id;
  let initialPage, initialReplyPages;

  if (post.commentCount > 0) {
    ({ initialPage, initialReplyPages } = await fetchComments(
      postId,
      userCookie
    ));
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
