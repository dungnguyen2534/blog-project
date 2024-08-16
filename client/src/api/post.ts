import http from "@/lib/http";
import { createPostBody, Post } from "@/validation/schema/post";

const PostsAPI = {
  async createPost(values: createPostBody) {
    const res = await http.post<Post>("/posts", values);
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
  async getPostList() {
    const res = await http.get<Post[]>("/posts");
    return res.payload;
  },
  async getSlugs() {
    const res = await http.get<string[]>("/posts/slugs");
    return res.payload;
  },
  async getPost(slug: string) {
    const res = await http.get<Post>(`/posts/${slug}`);
    return res.payload;
  },
};

export default PostsAPI;
