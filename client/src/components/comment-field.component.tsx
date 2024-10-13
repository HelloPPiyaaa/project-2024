import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import { BlogContext } from "../Screens/blog.page";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

interface CommentFieldProps {
  action: string; // หรือกำหนด type อื่นหากจำเป็น
}

const CommentField = ({ action }: CommentFieldProps) => {
  const [comment, setComment] = useState("");

  const blogContext = useContext(BlogContext);
  let {
    userAuth: { access_token, username, fullname, profile_picture },
  } = useContext(UserContext);

  if (!blogContext) {
    return null;
  }
  const {
    blog,
    blog: { _id, author, comments, activity, activity: blogActivity },
    setBlog,
    setTotalParentCommentsLoaded,
  } = blogContext;

  const blog_author = author?._id;
  const total_comments = blogActivity?.total_comments || 0;
  const total_parent_comments = blogActivity?.total_parent_comments || 0;

  const handleComment = () => {
    if (!access_token) {
      return toast.error("เข้าสู่ระบบเพื่อแสดงความคิดเห็น");
    }
    if (!comment.length) {
      return toast.error("เขียนอะไรบางอย่างเพื่อแสดงความคิดเห็น");
    }

    axios
      .post(
        API_BASE_URL + "/create-blog/add-comment",
        { _id, blog_author, comment },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setComment("");
        data.commented_by = { username, profile_picture, fullname };

        let newCommentArr;

        data.childrenLevel = 0;
        newCommentArr = [data];

        let parentCommentIncrementVal = 1;

        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
        });

        setTotalParentCommentsLoaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="แสดงความคิดเห็น..."
        className="input-box comment-area"
      ></textarea>
      <button className="btn-dark mt-3 px-3" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
