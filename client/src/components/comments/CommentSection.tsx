import ArticlesAPI from "@/api/article";
import CommentList from "./CommentList";
import CommentsContextProvider from "@/context/CommentsContext";
import CommentCount from "./CommentCount";
import CreateCommentBox from "./CreateCommentBox";
import { Article } from "@/validation/schema/article";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cache } from "react";

interface CommentSectionProps {
  article: Article;
  userCookie?: RequestCookie;
}

const fetchComments = cache(
  async (articleId: string, userCookie?: RequestCookie) => {
    try {
      const initialPage = await ArticlesAPI.getCommentList(
        articleId,
        `articles/${articleId}/comments?limit=12`,
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

        const replyPage = await ArticlesAPI.getCommentList(
          articleId,
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

export default async function CommentSection({ article }: CommentSectionProps) {
  const articleId = article._id;
  let initialPage, initialReplyPages;

  if (article.commentCount > 0) {
    ({ initialPage, initialReplyPages } = await fetchComments(articleId));
  }

  return (
    <CommentsContextProvider
      initialPage={initialPage}
      initialReplyPages={initialReplyPages}
      article={article}>
      <section className="rounded-t-none sm:py-5 p-3">
        <div className="max-w-prose mx-auto">
          <div className="mb-6">
            <div className="flex gap-1 text-2xl font-extrabold mb-4">
              <span>Comments</span>
              {<CommentCount />}
            </div>
            <CreateCommentBox article={article} />
          </div>
          <CommentList />
        </div>
      </section>
    </CommentsContextProvider>
  );
}
