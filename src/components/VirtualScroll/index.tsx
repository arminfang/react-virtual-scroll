import React, { useEffect, useRef, useState } from "react";
import { useResizeObserver, useIntersection } from "@armin4fun/react-hooks";

import { getVisibleHeight, throttle } from "src/lib/helpers";
import LoadingSvg from "src/assets/loading.svg?react";

import { VirtualScrollProps, DataItem } from "./interface";

import "./index.css";

const DEFAULT_COLUMN = [
  { gap: 24, maxW: 620, num: 1 },
  { gap: 24, maxW: 768, num: 2 },
  { gap: 24, maxW: 1024, num: 3 },
  { gap: 24, maxW: 1280, num: 4 },
];

const VirtualScroll: React.FC<VirtualScrollProps> = ({
  breakpoints = DEFAULT_COLUMN,
  dataSource,
  hasNextPage,
  maxColumns,
  maxGap = 24,
  onRenderComplete,
  onRequestAppend,
  renderItem,
}) => {
  const initCount =
    breakpoints.find((item) => window.innerWidth <= item.maxW)?.num ||
    maxColumns;
  const initGap =
    breakpoints.find((item) => window.innerWidth <= item.maxW)?.gap || maxGap;
  const [columnWidth, setColumnWidth] = useState(0); // 列宽
  const [columnCount, setColumnCount] = useState(initCount); // 列数量
  const [columnGap, setColumnGap] = useState(initGap); // 列间隔
  const [totalData, setTotalData] = useState<DataItem[]>([]); // 全部数据
  const [virtualData, setVirtualData] = useState<DataItem[]>([]); // 实际渲染数据
  const [viewportHeight, setViewportHeight] = useState(0); // 视口高度
  const [scrollTop, setScrollTop] = useState(0); // 已滚动距离
  const [heights, setHeights] = useState<number[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const isLoadingShow = useIntersection(loadingRef.current);

  const calcItemHeight = (width: number, height: number) => {
    let ratio = width / height;
    if (!width || !height) {
      ratio = 1;
    }
    return columnWidth / ratio;
  };

  // 计算每列高度 及 元素位置
  const calcHeights = () => {
    const tempHeights: number[] = [];
    const tempData: DataItem[] = [];
    if (columnWidth > 0) {
      dataSource.forEach((item, index) => {
        const calculatedHeight = calcItemHeight(item.width, item.height);
        if (index < columnCount) {
          tempHeights.push(calculatedHeight + columnGap);
          const top = 0;
          const left = index * (columnWidth + columnGap);
          tempData.push({
            ...item,
            originIndex: index,
            style: {
              height: calculatedHeight,
              left,
              top,
              width: columnWidth,
            },
          });
        } else {
          const minHeight = Math.min(...tempHeights);
          const minIndex = tempHeights.findIndex((h) => h === minHeight);
          tempHeights[minIndex] = minHeight + calculatedHeight + columnGap;
          const top = minHeight;
          const left = minIndex * (columnWidth + columnGap);
          tempData.push({
            ...item,
            originIndex: index,
            style: {
              height: calculatedHeight,
              left,
              top,
              width: columnWidth,
            },
          });
        }
      });
    }

    setHeights(tempHeights);
    setTotalData(tempData);
  };

  // 计算列数/列宽/列间距
  const calcColumns = () => {
    const tempContainerWidth =
      contentRef.current?.offsetWidth ?? document.body.offsetWidth;
    const count =
      breakpoints.find((item) => document.body.offsetWidth <= item.maxW)?.num ||
      maxColumns;
    const gap =
      breakpoints.find((item) => document.body.offsetWidth <= item.maxW)?.gap ||
      maxGap;
    const width = (tempContainerWidth - (count - 1) * gap) / count;

    setColumnCount(count);
    setColumnGap(gap);
    setColumnWidth(width);
  };

  // 计算实际渲染元素
  const calcRenderData = () => {
    // 第一个与视口交叉的元素
    const firstIndex = totalData.findIndex((item) => {
      const { height, top } = item.style;
      return height + top > scrollTop;
    });
    // 最后一个与视口交叉的元素
    const lastIndex = totalData.findIndex((item) => {
      return item.style?.top >= viewportHeight + scrollTop;
    });
    const startIndex = Math.max(0, firstIndex - 20);
    const endIndex = (lastIndex > -1 ? lastIndex : totalData.length - 1) + 20;
    const tempRenderData = totalData.slice(
      startIndex,
      Math.min(endIndex, totalData.length)
    );

    setVirtualData(tempRenderData);
    setTimeout(() => {
      onRenderComplete?.();
    }, 0);
  };

  const calcScrollTop = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const tempScrollTop = rect.top >= 0 ? 0 : rect.top * -1;
      setScrollTop(tempScrollTop);
      return;
    }
    setScrollTop(0);
  };

  const calcVisibleHeight = () => {
    const height = getVisibleHeight(containerRef?.current);
    setViewportHeight(height);
  };

  useEffect(() => {
    const scrollFnc = throttle(() => {
      calcScrollTop();
      calcVisibleHeight();
    }, 50);

    document.addEventListener("scroll", scrollFnc);

    return () => {
      document.removeEventListener("scroll", scrollFnc);
    };
  }, []);

  useEffect(() => {
    calcRenderData();
  }, [scrollTop, totalData]);

  useEffect(() => {
    calcHeights();
  }, [columnWidth, dataSource]);

  useResizeObserver({
    callback: () => {
      calcColumns();
      calcVisibleHeight();
    },
    delayMs: 100,
  });

  useEffect(() => {
    if (isLoadingShow) {
      onRequestAppend();
    }
  }, [isLoadingShow]);

  const contentHeight = Math.max(...heights, 0) + 48;

  return (
    <div className="virtual-scroll-container" ref={containerRef}>
      <div
        className="virtual-scroll-empty-box"
        style={{ height: contentHeight }}
      />
      <div ref={contentRef} style={{ height: contentHeight, width: "100%" }}>
        {heights.length > 0 && (
          <>
            {virtualData.map((item) => {
              const { id, originIndex, style } = item;
              return (
                <div
                  key={id + `_${originIndex}`}
                  className="virtual-scroll-item"
                  style={{
                    height: style.height.toFixed(2) + "px",
                    transform: `translate3d(${style.left}px, ${style.top}px, 0)`,
                    width: style.width.toFixed(2) + "px",
                  }}
                >
                  <div style={{ height: "100%", width: "100%" }}>
                    {renderItem(item, originIndex + 1)}
                  </div>
                </div>
              );
            })}
          </>
        )}
        {hasNextPage && (
          <div
            className="virtual-scroll-loading"
            ref={loadingRef}
            style={{
              top: contentHeight - 48,
            }}
          >
            <LoadingSvg />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualScroll;
