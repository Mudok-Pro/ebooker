"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Page {
  id: string;
  page_number: number;
  url?: string;
}

interface Props {
  pages: Page[];
  bookTitle: string;
  userName: string;
  userEmail: string;
  bookId: string;
}

export default function ReaderClient({
  pages,
  bookTitle,
  userName,
  userEmail,
  bookId,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fitToWidth, setFitToWidth] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Record<number, boolean>>({});
  const [failedPages, setFailedPages] = useState<Record<number, boolean>>({});
  const pinchStateRef = useRef<{
    distance: number;
    startZoom: number;
    midpointX: number;
    midpointY: number;
  } | null>(null);
  const totalPages = pages.length;
  const currentPage = pages[currentIndex];
  const loadingUrl = !loadedPages[currentPage.page_number];

  const pageUrls = useMemo(() => {
    return Object.fromEntries(
      pages
        .filter((page) => Boolean(page.url))
        .map((page) => [page.page_number, page.url!])
    );
  }, [pages]);

  const markPageFailed = useCallback((pageNumber: number) => {
    setFailedPages((prev) => (prev[pageNumber] ? prev : { ...prev, [pageNumber]: true }));
  }, []);

  const markPageLoaded = useCallback((pageNumber: number) => {
    setLoadedPages((prev) => (prev[pageNumber] ? prev : { ...prev, [pageNumber]: true }));
  }, []);

  useEffect(() => {
    function preventBrowserActions(event: MouseEvent | KeyboardEvent) {
      if (event instanceof MouseEvent && event.type === "contextmenu") {
        event.preventDefault();
      }

      if (
        event instanceof KeyboardEvent &&
        ((event.ctrlKey || event.metaKey) && ["c", "s", "u"].includes(event.key.toLowerCase()) ||
          event.key === "PrintScreen")
      ) {
        event.preventDefault();
      }
    }

    document.addEventListener("contextmenu", preventBrowserActions);
    document.addEventListener("keydown", preventBrowserActions);
    return () => {
      document.removeEventListener("contextmenu", preventBrowserActions);
      document.removeEventListener("keydown", preventBrowserActions);
    };
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(pages.length - 1, prev + 1));
  }, [pages.length]);

  const clampZoom = useCallback((value: number) => {
    return Math.min(200, Math.max(80, value));
  }, []);

  const getFitWidthZoom = useCallback(() => {
    if (typeof window === "undefined") return 100;

    const availableWidth = Math.max(260, window.innerWidth - 32);
    return clampZoom(Math.round((availableWidth / 900) * 100));
  }, [clampZoom]);

  const handleZoomChange = useCallback((nextValue: number) => {
    setFitToWidth(false);
    setZoomLevel(clampZoom(nextValue));
  }, [clampZoom]);

  const handleResetZoom = useCallback(() => {
    setFitToWidth(false);
    setZoomLevel(100);
  }, []);

  const handleFitWidthToggle = useCallback(() => {
    if (fitToWidth) {
      setFitToWidth(false);
      setZoomLevel(100);
      return;
    }

    const nextZoom = getFitWidthZoom();
    setFitToWidth(true);
    setZoomLevel(nextZoom);
  }, [fitToWidth, getFitWidthZoom]);

  useEffect(() => {
    if (!fitToWidth) return;

    const updateFitWidthZoom = () => {
      setZoomLevel(getFitWidthZoom());
    };

    updateFitWidthZoom();
    window.addEventListener("resize", updateFitWidthZoom);
    return () => window.removeEventListener("resize", updateFitWidthZoom);
  }, [fitToWidth, getFitWidthZoom]);

  const currentUrl = pageUrls[currentPage.page_number] ||
    `/api/pages?bookId=${encodeURIComponent(bookId)}&pageNumber=${currentPage.page_number}&v=2`;
  const pageLoadFailed = failedPages[currentPage.page_number];

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;

    const [touchA, touchB] = [event.touches[0], event.touches[1]];
    const distance = Math.hypot(
      touchA.clientX - touchB.clientX,
      touchA.clientY - touchB.clientY,
    );
    const midpointX = (touchA.clientX + touchB.clientX) / 2;
    const midpointY = (touchA.clientY + touchB.clientY) / 2;

    pinchStateRef.current = {
      distance,
      startZoom: zoomLevel,
      midpointX,
      midpointY,
    };
    setFitToWidth(false);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchStateRef.current) return;

    const [touchA, touchB] = [event.touches[0], event.touches[1]];
    const distance = Math.hypot(
      touchA.clientX - touchB.clientX,
      touchA.clientY - touchB.clientY,
    );
    const midpointX = (touchA.clientX + touchB.clientX) / 2;
    const midpointY = (touchA.clientY + touchB.clientY) / 2;
    const scale = distance / pinchStateRef.current.distance;
    const nextZoom = clampZoom(pinchStateRef.current.startZoom * scale);

    setZoomLevel(nextZoom);

    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = midpointX - centerX;
    const deltaY = midpointY - centerY;

    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      container.style.transformOrigin = `${Math.max(0, Math.min(100, ((midpointX - rect.left) / rect.width) * 100))}% ${Math.max(0, Math.min(100, ((midpointY - rect.top) / rect.height) * 100))}%`;
    }
  };

  const handleTouchEnd = () => {
    pinchStateRef.current = null;
  };

  return (
    <div className="flex min-h-screen select-none flex-col bg-gray-900">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-gray-800/95 px-4 py-3 text-white backdrop-blur-sm">
        <Link href="/library">
          <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-white hover:bg-gray-700">
            <ArrowRight className="h-4 w-4" />
            المكتبة
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">{bookTitle}</span>
          <span className="text-gray-400">
            {currentPage.page_number} / {pages[pages.length - 1]?.page_number || totalPages}
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-auto px-4 pb-40 pt-4 sm:pb-28">
        <div className="relative isolate flex w-full max-w-4xl justify-center">
          {pageLoadFailed ? (
            <div className="flex flex-col items-center justify-center gap-3 py-32 text-white">
              <span>تعذر تحميل الصفحة</span>
            </div>
          ) : currentUrl ? (
            <div
              className="relative mx-auto flex w-full max-w-full justify-center origin-top transition-transform duration-150 ease-out"
              style={{
                isolation: "isolate",
                zoom: zoomLevel / 100,
                maxWidth: "min(100%, 900px)",
                touchAction: "none",
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <div className="relative inline-block overflow-hidden rounded-lg shadow-2xl">
                <Image
                  key={currentPage.page_number}
                  src={currentUrl}
                  alt={`صفحة ${currentPage.page_number}`}
                  width={900}
                  height={1200}
                  priority={currentIndex === 0}
                  loading={currentIndex === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, 900px"
                  onLoad={() => markPageLoaded(currentPage.page_number)}
                  onError={() => markPageFailed(currentPage.page_number)}
                  className={`relative z-0 block h-auto max-h-[calc(100vh-10rem)] w-auto max-w-full transition-opacity ${loadingUrl ? "opacity-0" : "opacity-100"}`}
                  style={{ zIndex: 0, maxHeight: "calc(100vh - 10rem)" }}
                  unoptimized
                />
                {loadingUrl ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>جاري تحميل الصفحة</span>
                  </div>
                ) : null}
                <div
                  className="pointer-events-none absolute left-0.5 top-0.5 z-10 max-w-[calc(100%-1.5rem)] text-[8px] font-bold leading-tight text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:left-0.5 sm:top-0.5 sm:text-[10px]"
                  style={{ zIndex: 10 }}
                >
                  {userName}:{userEmail}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-32 text-white">
              فشل تحميل الصفحة
            </div>
          )}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 flex flex-wrap items-center justify-center gap-2 border-t border-gray-700 bg-gray-800/95 px-2 py-2 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3">
        <div className="flex max-w-full items-center gap-1 rounded-md border border-gray-600 bg-gray-700 px-1 py-1 sm:gap-2 sm:px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoomChange(zoomLevel - 10)}
            className="h-8 w-8 shrink-0 border-gray-500 bg-transparent p-0 text-white hover:bg-gray-600"
            aria-label="Zoom out"
          >
            −
          </Button>
          <span className="min-w-12 text-center text-xs font-medium text-gray-200">
            {zoomLevel}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoomChange(zoomLevel + 10)}
            className="h-8 w-8 shrink-0 border-gray-500 bg-transparent p-0 text-white hover:bg-gray-600"
            aria-label="Zoom in"
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="h-8 shrink-0 border-gray-500 bg-transparent px-2 text-[10px] font-medium text-white hover:bg-gray-600"
            aria-label="Reset zoom"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFitWidthToggle}
            className="h-8 shrink-0 border-gray-500 bg-transparent px-2 text-[10px] font-medium text-white hover:bg-gray-600"
            aria-label="Toggle fit width"
          >
            {fitToWidth ? "Fit: On" : "Fit Width"}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="shrink-0 gap-1 text-white hover:bg-transparent hover:text-white"
          aria-label="Previous page"
        >
          <span className="sm:hidden">&lt;</span>
          <span className="hidden sm:inline">
            <ChevronRight className="h-4 w-4" />
            السابق
          </span>
        </Button>
        <span className="min-w-16 shrink-0 text-center text-sm text-gray-400">
          {currentPage.page_number}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex === totalPages - 1}
          className="shrink-0 gap-1 text-white hover:bg-transparent hover:text-white"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">
            التالي
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span className="sm:hidden">&gt;</span>
        </Button>
      </footer>
    </div>
  );
}
