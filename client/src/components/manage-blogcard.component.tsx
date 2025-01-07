import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
  return (
    <div className="stat-blogs">
      {Object.keys(stats).map((key, i) => {
        return !key.includes("parent") ? (
          <div key={i} className={"stat-key " + (i !== 0 ? " stat-keyi " : "")}>
            <h1 className="stat-h1">{stats[key].toLocaleString()}</h1>
            <p className="stat-p">{key.split("_")[1]}</p>
          </div>
        ) : (
          ""
        );
      })}
    </div>
  );
};

export const ManagePublishedBlogCard = ({ blog }) => {
  let { banner, blog_id, topic, publishedAt, activity } = blog;
  let [showStat, setShowStat] = useState(false);
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  console.log(showStat);
  return (
    <>
      <div className="manage-blogpage">
        <img src={banner} alt="" className="img-manageblog" />

        <div className="manage-blogdetail">
          <div>
            <Link
              to={`/blog/${blog_id}`}
              className="blog-title mb-4 manage-link"
            >
              {topic}
            </Link>

            <p className="clamp-1">เผยแพร่เมื่อ: {getDay(publishedAt)}</p>
          </div>

          <div className="d-flex gap-3 mt-3">
            <Link to={`/editor/${blog_id}`} className="stat-button">
              แก้ไข
            </Link>

            <button
              className="lg-hidden stat-button"
              onClick={() => setShowStat((preVal) => !preVal)}
            >
              สถิติ
            </button>

            <button
              className="stat-button "
              style={{ color: "red" }}
              onClick={(e) => deleteBlog(blog, access_token, e.target)}
            >
              ลบ
            </button>
          </div>
        </div>

        <div className="hidden-max-lg">
          <BlogStats stats={activity} />
        </div>
      </div>

      {showStat ? (
        <div className="lg-hidden">
          <BlogStats stats={activity} />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export const ManageDraftBlogPost = ({ blog }) => {
  let { topic, des, blog_id, index } = blog;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  index++;

  return (
    <div className="draft-blogcard">
      <h1 className="blog-index index-front">
        {index < 10 ? "0" + index : index}
      </h1>

      <div>
        <h1 className="blog-title mb-3">{topic}</h1>
        <p className="clamp-2">{des.length ? des : "ไม่มีรายละเอียดบล็อก"}</p>

        <div className="flex gap-3 mt-3">
          <Link to={`/editor/${blog_id}`} className="stat-button">
            แก้ไข
          </Link>

          <button
            className="stat-button "
            style={{ color: "red" }}
            onClick={(e) => deleteBlog(blog, access_token, e.target)}
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

const deleteBlog = (blog, access_token, target) => {
  let { index, blog_id, setStateFunc } = blog;

  target.setAttribute("disabled", true);

  axios
    .post(
      `${import.meta.env.VITE_DOMAIN}/create-blog/delete-blog`,
      { blog_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    .then(({ data }) => {
      target.removeAttribute("disabled");

      setStateFunc((preVal) => {
        let { deleteDocCount, totalDocs, result } = preVal;

        result.splice(index, 1);

        if (!deleteDocCount) {
          deleteDocCount = 0;
        }

        if (!result.length && totalDocs - 1 > 0) {
          return null;
        }

        console.log({
          ...preVal,
          totalDocs: totalDocs - 1,
          deleteDocCount: deleteDocCount + 1,
        });
        return {
          ...preVal,
          totalDocs: totalDocs - 1,
          deleteDocCount: deleteDocCount + 1,
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
