import { ReactNode, useEffect, useRef, useState } from "react";
import "../misc/inpage.css";
import React from "react";

interface InPageNavigationProps {
  routes: string[];
  defaultHidden?: string[];
  defaultActiveIndex?: number;
  children: ReactNode;
}

export const activeTabLineRef = React.createRef<HTMLHRElement>();
export const activeTabRef = React.createRef<HTMLButtonElement>();

const InPageNavigation: React.FC<InPageNavigationProps> = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  const activeTabLineRef = useRef<HTMLHRElement>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

  let [isResizeEventAdded, setIsResizeEventAdded] = useState(false);
  let [width, setWidth] = useState(window.innerWidth);

  const changePageState = (btn: HTMLButtonElement, i: number) => {
    const { offsetWidth, offsetLeft } = btn;

    if (activeTabLineRef.current) {
      activeTabLineRef.current.style.width = offsetWidth + "px";
      activeTabLineRef.current.style.left = offsetLeft + "px";
    }

    setInPageNavIndex(i);
  };

  useEffect(() => {
    if (width > 766 && inPageNavIndex !== defaultActiveIndex) {
      changePageState(activeTabRef.current, defaultActiveIndex);
    }

    if (!isResizeEventAdded) {
      window.addEventListener("resize", () => {
        if (!isResizeEventAdded) {
          setIsResizeEventAdded(true);
        }

        setWidth(window.innerWidth);
      });
    }
  }, [defaultActiveIndex, width]);

  console.log(width);

  return (
    <>
      <div className="inpage">
        {routes.map((route, i) => {
          return (
            <button
              ref={i === defaultActiveIndex ? activeTabRef : null}
              key={i}
              className={
                "button-change" +
                (inPageNavIndex === i ? " text-black" : " text-dark-grey") +
                (defaultHidden.includes(route) ? " d-block d-md-none" : " ")
              }
              onClick={(e) => {
                changePageState(e.target as HTMLButtonElement, i);
              }}
            >
              {route}
            </button>
          );
        })}
        <hr ref={activeTabLineRef} className="underline-hr m-0" />
      </div>

      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
