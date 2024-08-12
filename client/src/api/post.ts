import http from "@/lib/http";
import { createPostBody, Post } from "@/validation/schema/post";

const PostsAPI = {
  async createPost(input: createPostBody) {
    const res = await http.post<Post>("/posts", input);
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
