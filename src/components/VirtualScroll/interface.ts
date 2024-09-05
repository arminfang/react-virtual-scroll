/* eslint-disable @typescript-eslint/no-explicit-any */
interface BreakPointItem {
  maxW: number;
  num: number;
  gap: number;
}

export interface DataItem {
  width: number;
  height: number;
  id: string;
  [key: string]: any;
}

export interface renderItem extends DataItem {
  style: {
    height: number;
    left: number;
    top: number;
    width: number;
  };
}

export interface VirtualScrollProps {
  dataSource: DataItem[];
  hasNextPage: boolean;
  renderItem: (item: DataItem, index?: number) => React.ReactNode;
  onRequestAppend: () => void;
  onRenderComplete?: () => void;
  breakpoints?: BreakPointItem[];
  maxColumns: number;
  maxGap?: number;
}
