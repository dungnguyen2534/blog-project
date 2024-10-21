import http from "@/lib/http";
import { Tag } from "@/validation/schema/tag";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

const TagsAPI = {
  async getTags(cookie?: RequestCookie) {
    const res = await http.get<Tag[]>(`/tags/`, {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });
    return res.payload;
  },
  async getTagInfo(tagName: string, cookie?: RequestCookie) {
    const res = await http.get<Tag>(`/tags/${tagName}`, {
      headers: {
        cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });
    return res.payload;
  },
  async followTag(tagName: string) {
    const res = await http.article<{ followerCount: number }>(
      `/tags/${tagName}/follow`
    );
    return res.payload;
  },
  async unFollowTag(tagName: string) {
    const res = await http.delete<{ followerCount: number }>(
      `/tags/${tagName}/unfollow`
    );
    return res.payload;
  },
};

export default TagsAPI;
