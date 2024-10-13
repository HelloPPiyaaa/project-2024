import { useContext } from "react";
import "../misc/blogpage.css";
import { BlogContext } from "../Screens/blog.page";
import { MdClose } from "react-icons/md";
import CommentField from "./comment-field.component";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

// export const fetchComments = async ({
//   skip = 0,
//   blog_id,
//   setParentCommentCountFun,
//   comment_array = null,
// }) => {
//   let res;

//   await axios
//     .post(API_BASE_URL + "/create-blog/get-blog-comments", { blog_id, skip })
//     .then(({ data }) => {
//       data.map((comment) => {
//         comment.childrenLevel = 0;
//       });

//       setParentCommentCountFun((preVal) => preVal + data.length);

//       if (comment_array === null) {
//         res = { results: data };
//       } else {
//         res = { results: [...comment_array, ...data] };
//       }
//     });
//   return res;
// };

export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}: {
  skip?: number;
  blog_id: string;
  setParentCommentCountFun: (val: number) => void;
  comment_array?: any[] | null;
}) => {
  let res;

  await axios
    .post<{ childrenLevel?: number }[]>(
      API_BASE_URL + "/create-blog/get-blog-comments",
      { blog_id, skip }
    )
    .then(({ data }) => {
      data.map((comment) => {
        comment.childrenLevel = 0;
      });

      // ดึงค่า parent comment ปัจจุบันจาก state แล้วคำนวณจำนวนใหม่
      const newParentCommentCount = data.length;
      setParentCommentCountFun(newParentCommentCount);

      if (comment_array === null) {
        res = { results: data };
      } else {
        res = { results: [...comment_array, ...data] };
      }
    });
  return res;
};

const CommentsContainer = () => {
  const context = useContext(BlogContext);

  // ตรวจสอบว่า context ไม่ใช่ undefined
  if (!context) {
    return null;
  }

  const {
    blog: { topic },
    commentWrapper,
    setCommentWrapper,
  } = context;
  return (
    <div
      className={
        "comments-component " +
        (commentWrapper ? "commentWrapper " : "commentWrapper2") +
        " comments-component2"
      }
    >
      <div className="position-relative">
        <h1 className="fw-medium fs-4">Comments</h1>
        <p className="m-0 p-topicincommemt">{topic}</p>

        <button
          onClick={() => setCommentWrapper((preVal) => !preVal)}
          className="position-absolute top-0  d-flex justify-content-center align-items-center rounded-circle "
          style={{
            height: "3rem",
            width: "3rem",
            background: "#f0f0f0",
            right: "0",
          }}
        >
          <MdClose className=" fs-3" />
        </button>
      </div>

      <hr
        className="border-grey my-4"
        style={{ width: "120%", marginLeft: "-1.5rem" }}
      />
      <CommentField action={"แสดงความคิดเห็น"} />
    </div>
  );
};

export default CommentsContainer;
