import http from "@/lib/http";
import {
  Comment,
  CommentPage,
  CommentBody,
  ArticleBody,
  Article,
  ArticlePage,
  CommentStatus,
} from "@/validation/schema/article";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

const ArticlesAPI = {
  async createArticle(values: ArticleBody) {
    const res = await http.post<Article>("/articles", values);
    return res.payload;
  },
  async updateArticle(id: string, values: ArticleBody) {
    const res = await http.patch<Article>("/articles/" + id, values);
    return res.payload;
  },
  async deleteArticle(id: string) {
    const res = await http.delete<Article>("/articles/" + id);
    return res.payload;
  },
  async uploadInArticleImage(image: File) {
    const formData = new FormData();
    formData.append("inArticleImage", image);
    const res = await http.post<{ imageUrl: string }>(
      "/articles/images",
      formData
    );
    return res.payload;
  },
  async deleteUnusedImages() {
    const res = await http.delete("/articles/images");
    return res.payload;
  },
  async getArticleList(
    signal?: AbortSignal,
    url?: string,
    cookie?: RequestCookie
  ) {
    const res = await http.get<ArticlePage>(url || "/articles", {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      next: { tags: ["articles"] },
      signal: signal,
    });
    return res.payload;
  },

  async getTopArticles(
    signal?: AbortSignal,
    timeSpan?: "week" | "month" | "year" | "infinity",
    continueAfterId?: string,
    continueAfterLikeCount?: string,
    limit?: number,
    cookie?: RequestCookie
  ) {
    const queryParts = [
      continueAfterId ? `continueAfterId=${continueAfterId}` : "",
      continueAfterLikeCount
        ? `continueAfterLikeCount=${continueAfterLikeCount}`
        : "",
      limit ? `limit=${limit}` : "",
    ]
      .filter((part) => part !== "")
      .join("&");

    const url = `/articles/top/${timeSpan}?${queryParts}`;
    const res = await http.get<ArticlePage>(url, {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      next: { tags: ["top-articles"] },
      signal: signal,
    });
    return res.payload;
  },
  async getSlugs() {
    const res = await http.get<string[]>("/articles/slugs");
    return res.payload;
  },
  async getArticle(slug: string, userCookie?: RequestCookie) {
    const res = await http.get<Article>("/articles/" + slug, {
      headers: {
        cookie: userCookie ? `${userCookie.name}=${userCookie.value}` : "",
      },
      next: { tags: [slug] },
    });
    return res.payload;
  },
  async saveArticle(articleId: string) {
    const res = await http.post(`/articles/${articleId}/save`);
    return res.payload;
  },
  async getSavedTags(cookie?: RequestCookie) {
    const res = await http.get<string[]>("/articles/saved-tags", {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });
    return res.payload;
  },
  async getSavedArticles(
    signal?: AbortSignal,
    tag?: string,
    searchQuery?: string,
    continueAfterId?: string,
    cookie?: RequestCookie
  ) {
    const res = await http.get<ArticlePage>(
      `/articles/saved-articles?${tag ? "&tag=" + tag : ""}${
        searchQuery ? "&searchQuery=" + searchQuery : ""
      }${continueAfterId ? "&continueAfterId=" + continueAfterId : ""}`,
      {
        headers: {
          cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
        },
        signal: signal,
      }
    );
    return res.payload;
  },
  async unsaveArticle(articleId: string) {
    const res = await http.delete(`/articles/${articleId}/unsave`);
    return res.payload;
  },
  async createComment(articleId: string, values: CommentBody) {
    const res = await http.post<Comment>(
      `/articles/${articleId}/comments`,
      values
    );
    return res.payload;
  },
  async editComment(articleId: string, commentId: string, values: CommentBody) {
    const res = await http.patch<Comment>(
      `/articles/${articleId}/comments/${commentId}`,
      values
    );
    return res.payload;
  },
  async deleteComment(articleId: string, commentId: string) {
    const res = await http.delete<{ totalComments: number }>(
      `/articles/${articleId}/comments/${commentId}`
    );
    return res.payload;
  },
  async uploadInCommentImage(articleId: string, image: File) {
    const formData = new FormData();
    formData.append("inCommentImage", image);
    const res = await http.post<{ imageUrl: string }>(
      `/articles/${articleId}/comments/images`,
      formData
    );
    return res.payload;
  },
  async getCommentList(
    articleId: string,
    url?: string,
    parentCommentId?: string,
    limit?: number,
    cookie?: RequestCookie
  ) {
    const res = await http.get<CommentPage>(
      url
        ? `${url}`
        : `/articles/${articleId}/comments?${
            parentCommentId ? `parentCommentId=${parentCommentId}&` : ""
          }${limit ? `limit=${limit}` : ""}`,
      {
        headers: {
          cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
        },
      }
    );
    return res.payload;
  },
  async like(targetId: string, targetType: "article" | "comment") {
    const res = await http.post<{ totalLikes: number }>(
      `/${targetType}/${targetId}/like`
    );
    return res.payload;
  },
  async unlike(targetId: string, targetType: "article" | "comment") {
    const res = await http.post<{ totalLikes: number }>(
      `/${targetType}/${targetId}/unlike`
    );
    return res.payload;
  },
};

export default ArticlesAPI;
