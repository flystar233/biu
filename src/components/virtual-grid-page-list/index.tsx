import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { Spinner } from "@heroui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSize } from "ahooks";
import { twMerge } from "tailwind-merge";

import Empty from "@/components/empty";

export interface VirtualGridPageListProps<T> {
  items: T[];
  itemKey: keyof T | ((item: T) => React.Key);
  renderItem: (item: T, index: number) => React.ReactNode;
  getScrollElement: () => HTMLElement | null;
  className?: string;
  rowHeight?: number;
  columnFactor?: number;
  gap?: number;
  columnGap?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading: boolean;
}

const ROW_GAP = 16;

const VirtualGridPageList = <T,>({
  items,
  itemKey,
  renderItem,
  getScrollElement,
  className,
  rowHeight = 220,
  columnFactor = 1,
  gap = ROW_GAP,
  columnGap = gap,
  onLoadMore,
  hasMore,
  loading,
}: VirtualGridPageListProps<T>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialWidthRef = useRef(0);
  const size = useSize(wrapperRef);
  const getRootRef = useRef(getScrollElement);
  const loadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastTriggerTimeRef = useRef(0);
  const DEBOUNCE_DELAY = 300;
  const measureElement = useCallback((el: HTMLElement) => el.getBoundingClientRect().height, []);
  const width = size?.width || initialWidthRef.current || 0;

  useLayoutEffect(() => {
    if (initialWidthRef.current) return;
    const nextWidth = wrapperRef.current?.getBoundingClientRect().width ?? 0;
    if (nextWidth) initialWidthRef.current = nextWidth;
  }, []);

  const columns = useMemo(() => {
    const base = !width ? 2 : width >= 1536 ? 6 : width >= 1280 ? 5 : width >= 1024 ? 4 : width >= 768 ? 3 : 2;
    return base * columnFactor;
  }, [width, columnFactor]);

  const rows = useMemo(() => {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns));
    }
    return result;
  }, [items, columns]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize: () => rowHeight + gap,
    measureElement,
    overscan: 5,
  });

  const prevLoadingRef = useRef(loading);
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
    getRootRef.current = getScrollElement;
    hasMoreRef.current = hasMore;
    loadingRef.current = loading;
    // loading 从 true → false 时重置防抖计时，确保 sentinel 仍可见时能立即触发下一次加载
    if (prevLoadingRef.current && !loading) {
      lastTriggerTimeRef.current = 0;
    }
    prevLoadingRef.current = loading;
  }, [onLoadMore, getScrollElement, hasMore, loading]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const now = Date.now();
    for (const entry of entries) {
      if (
        entry.isIntersecting &&
        hasMoreRef.current &&
        !loadingRef.current &&
        now - lastTriggerTimeRef.current > DEBOUNCE_DELAY
      ) {
        lastTriggerTimeRef.current = now;
        loadMoreRef.current?.();
        return;
      }
    }
  }, []);

  // 使用 useLayoutEffect 确保 DOM 更新后再设置 observer
  useLayoutEffect(() => {
    const scrollElement = getRootRef.current();
    if (!scrollElement || !bottomRef.current) {
      return;
    }

    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: scrollElement,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0,
    });

    observerRef.current.observe(bottomRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleIntersection, width, rows.length]);

  if (!items.length && !loading) {
    return <Empty className="min-h-20" />;
  }

  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div ref={wrapperRef} className={twMerge("w-full", className)}>
      <div
        style={{
          height: totalSize,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const rowItems = rows[virtualRow.index] as T[];
          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                minHeight: virtualRow.size - gap,
                transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                paddingBottom: `${gap}px`,
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                columnGap: `${columnGap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const realIndex = virtualRow.index * columns + colIndex;
                const key =
                  typeof itemKey === "function"
                    ? itemKey(item)
                    : ((item[itemKey as keyof T] as React.Key) ?? realIndex);
                return <React.Fragment key={key}>{renderItem(item, realIndex)}</React.Fragment>;
              })}
            </div>
          );
        })}
      </div>
      {hasMore && loading && (
        <div className="flex w-full justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}
      <div ref={bottomRef} className="h-px w-full" />
    </div>
  );
};

export default VirtualGridPageList;
