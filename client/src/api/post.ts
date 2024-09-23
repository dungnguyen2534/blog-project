import http from "@/lib/http";
import {
  Comment,
  CommentPage,
  CreateCommentBody,
  createPostBody,
  Post,
  PostPage,
  updatePostBody,
} from "@/validation/schema/post";

const PostsAPI = {
  async createPost(values: createPostBody) {
    const res = await http.post<Post>("/posts", values);
    return res.payload;
  },
  async updatePost(id: string, values: updatePostBody) {
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
  async getPostList(url?: string) {
    const res = await http.get<PostPage>(url || "/posts", {
      cache: "no-cache",
    });
    return res.payload;
  },
  async getSlugs() {
    const res = await http.get<string[]>("/posts/slugs");
    return res.payload;
  },
  async getPost(slug: string) {
    const res = await http.get<Post>("/posts/" + slug);
    return res.payload;
  },
  async createComment(postId: string, values: CreateCommentBody) {
    const res = await http.post<Comment>(`/posts/${postId}/comments`, values);
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
  async getCommentList(postId: string, url?: string) {
    const res = await http.get<CommentPage>(
      url ? `${url}` : `/posts/${postId}/comments`,
      {
        cache: "no-cache",
      }
    );
    return res.payload;
  },
};

export default PostsAPI;
