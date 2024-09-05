import { useEffect, useState } from "react";
import { debounce } from "src/lib/helpers";

type ResizeParams = {
  callback: () => void;
  element?: Element;
  delayMs?: number;
};

const useResizeObserver = ({
  callback,
  delayMs = 100,
  element = document.documentElement,
}: ResizeParams) => {
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(
    null
  );

  useEffect(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    const observer: ResizeObserver = new ResizeObserver(
      debounce(callback, delayMs)
    );
    if (element) {
      observer.observe(element);
    }
    setResizeObserver(observer);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [element]);
};

export default useResizeObserver;
