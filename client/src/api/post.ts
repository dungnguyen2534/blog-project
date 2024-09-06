import http from "@/lib/http";
import {
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
    const res = await http.get<PostPage>(url || "/posts");
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
};

export default PostsAPI;
