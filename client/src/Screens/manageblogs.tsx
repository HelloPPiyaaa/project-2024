import {
  ChangeEvent,
  useContext,
  useEffect,
  useState,
  KeyboardEvent,
} from "react";
import { UserContext } from "../App";
import axios from "axios";
import { API_BASE_URL } from "../api/post";
import { filterPaginationData } from "../components/filter-pagination";
import { Toaster } from "react-hot-toast";
import { IoIosSearch } from "react-icons/io";
import "../misc/blogpage.css";
import InpageNavigation from "../components/Inpage-navigation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "./page-animation";

interface GetBlogsParams {
  page: number;
  draft: boolean;
  deleteDocCount?: number;
}

interface Blog {
  blog_id: string;
  title: string;
  content: string;
}

interface BlogsResponse {
  result: Blog[];
}

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState<BlogsResponse | null>(null);
  const [drafts, setDraft] = useState<BlogsResponse | null>(null);
  const [query, setQuery] = useState("");

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getBlogs = ({ page, draft, deleteDocCount = 0 }: GetBlogsParams) => {
    axios
      .post(
        API_BASE_URL + "/create-blog/user-written-blog",
        {
          page,
          draft,
          query,
          deleteDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: access_token || undefined,
          countRoute: "/create-blog/user-written-blog-count",
          data_to_send: { draft, query },
        });
        console.log("draft" + draft, formatedData);
        if (draft) {
          setDraft(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [access_token, blogs, drafts, query]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> & KeyboardEvent<HTMLInputElement>
  ) => {
    let searchQuery = e.target.value;
    setQuery(searchQuery);

    if (e.key === "Enter" && searchQuery.length) {
      setBlogs(null);
      setDraft(null);
    }
  };

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    if (!target.value.length) {
      setQuery("");
      setBlogs(null);
      setDraft(null);
    }
  };

  return (
    <>
      <h1 className="topic-mangeBlog">ตั้งค่าบล็อก</h1>
      <Toaster />

      <div className="position-relative search-mangepage">
        <input
          type="search"
          className="w-100 search-input"
          style={{ background: "#f0f0f0" }}
          placeholder="Search Blogs..."
          onChange={handleChange}
          onKeyDown={handleSearch}
        />

        <IoIosSearch className="position-absolute iosearch" />
      </div>

      <InpageNavigation routes={["บล็อกที่เผยแพร่แล้ว", "บล็อกที่จัดเก็บ"]}>
        {blogs === null ? (
          <Loader />
        ) : blogs.result.length ? (
          <>
            {blogs.result.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <h1>นี่คือบล็อกการ์ด</h1>
                </AnimationWrapper>
              );
            })}
          </>
        ) : (
          <NoDataMessage message="ไม่มีบล็อกที่เผยแพร่" />
        )}
      </InpageNavigation>
    </>
  );
};

export default ManageBlogs;
