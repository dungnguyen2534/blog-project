import CreateCommentBox from "./CreateCommentBox";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  return (
    <section className="secondary-container -mt-1 rounded-t-none sm:py-7 p-3 border-t-[1px]">
      <div className="max-w-prose mx-auto">
        <div className="text-2xl font-extrabold mb-4">Comments</div>
        <CreateCommentBox postId={postId} />
      </div>
    </section>
  );
}
