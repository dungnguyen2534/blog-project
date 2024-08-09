import http from "@/lib/http";
import { createPostBody, Post } from "@/validation/schema/post";

const PostsAPI = {
  async createPost(input: createPostBody) {
    const res = await http.post<Post>("/posts", input);
    return res.payload;
  },
  async getPosts() {
    const res = await http.get<Post[]>("/posts", { cache: "no-cache" });
    return res.payload;
  },
};

export default PostsAPI;
