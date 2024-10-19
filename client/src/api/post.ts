import http from "@/lib/http";
import {
  Comment,
  CommentPage,
  CommentBody,
  PostBody,
  Post,
  PostPage,
} from "@/validation/schema/post";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

const PostsAPI = {
  async createPost(values: PostBody) {
    const res = await http.post<Post>("/posts", values);
    return res.payload;
  },
  async updatePost(id: string, values: PostBody) {
    const res = await http.patch<Post>("/posts/" + id, values);
    return res.payload;
  },
  async deletePost(id: string) {
    const res = await http.delete<Post>("/posts/" + id);
    return res.payload;
  },
  async uploadInPostImage(image: File) {
    const formData = new FormData();
    formData.append("inPostImage", image);
    const res = await http.post<{ imageUrl: string }>(
      "/posts/images",
      formData
    );
    return res.payload;
  },
  async deleteUnusedImages() {
    const res = await http.delete("/posts/images");
    return res.payload;
  },
  async getPostList(url?: string, cookie?: RequestCookie) {
    const res = await http.get<PostPage>(url || "/posts", {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });
    return res.payload;
  },

  async getTopPosts(
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

    const url = `/posts/top/${timeSpan}?${queryParts}`;
    const res = await http.get<PostPage>(url, {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });
    return res.payload;
  },

  async getSlugs() {
    const res = await http.get<string[]>("/posts/slugs");
    return res.payload;
  },
  async getPost(slug: string, userCookie?: RequestCookie) {
    const res = await http.get<Post>("/posts/" + slug, {
      headers: {
        cookie: userCookie ? `${userCookie.name}=${userCookie.value}` : "",
      },
    });
    return res.payload;
  },
  async savePost(postId: string) {
    const res = await http.post(`/posts/${postId}/save`);
    return res.payload;
  },
  async getSavedTags(cookie?: RequestCookie) {
    const res = await http.get<string[]>("/posts/saved-tags", {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });
    return res.payload;
  },
  async getSavedPosts(
    tag?: string,
    searchQuery?: string,
    continueAfterId?: string,
    cookie?: RequestCookie
  ) {
    const res = await http.get<PostPage>(
      `/posts/saved-posts?${tag ? "&tag=" + tag : ""}${
        searchQuery ? "&searchQuery=" + searchQuery : ""
      }${continueAfterId ? "&continueAfterId=" + continueAfterId : ""}`,
      {
        headers: {
          cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
        },
      }
    );
    return res.payload;
  },
  async unsavePost(postId: string) {
    const res = await http.delete(`/posts/${postId}/unsave`);
    return res.payload;
  },
  async createComment(postId: string, values: CommentBody) {
    const res = await http.post<Comment>(`/posts/${postId}/comments`, values);
    return res.payload;
  },
  async editComment(postId: string, commentId: string, values: CommentBody) {
    const res = await http.patch<Comment>(
      `/posts/${postId}/comments/${commentId}`,
      values
    );
    return res.payload;
  },
  async deleteComment(postId: string, commentId: string) {
    const res = await http.delete<{ totalComments: number }>(
      `/posts/${postId}/comments/${commentId}`
    );
    return res.payload;
  },
  async uploadInCommentImage(postId: string, image: File) {
    const formData = new FormData();
    formData.append("inCommentImage", image);
    const res = await http.post<{ imageUrl: string }>(
      `/posts/${postId}/comments/images`,
      formData
    );
    return res.payload;
  },
  async getCommentList(
    postId: string,
    url?: string,
    parentCommentId?: string,
    limit?: number,
    cookie?: RequestCookie
  ) {
    const res = await http.get<CommentPage>(
      url
        ? `${url}`
        : `/posts/${postId}/comments?${
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
  async like(targetId: string, targetType: "post" | "comment") {
    const res = await http.post<{ totalLikes: number }>(
      `/${targetType}/${targetId}/like`
    );
    return res.payload;
  },
  async unlike(targetId: string, targetType: "post" | "comment") {
    const res = await http.post<{ totalLikes: number }>(
      `/${targetType}/${targetId}/unlike`
    );
    return res.payload;
  },
  async getLikeStatus(targetId: string, targetType: "post" | "comment") {
    const res = await http.get<{ liked: boolean }>(
      `/${targetType}/${targetId}/status`
    );
    return res.payload;
  },
};

export default PostsAPI;
