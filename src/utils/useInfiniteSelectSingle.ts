import { useState, useEffect, useCallback, useRef, useMemo } from "react";

export interface UseInfiniteSelectSingleOptions<T> {
  currentPageItems: T[];
  page: number;
  searchTerm: string;
  isLoading: boolean;
  hasMore: boolean;
  meta: any;
  getId: (item: T) => string;
  entityName?: string;
  onPageChange: (page: number) => void;
  onSearchChange: (searchTerm: string) => void;
}

export interface UseInfiniteSelectSingleReturn<T> {
  accumulatedItems: T[];
  handleLoadMore: () => void;
  handleSearch: (searchTerm: string) => void;
  resetState: () => void;
}

export function useInfiniteSelectSingle<T>({
  currentPageItems,
  page,
  searchTerm,
  isLoading,
  hasMore,
  meta,
  getId,
  entityName = "item",
  onPageChange,
  onSearchChange,
}: UseInfiniteSelectSingleOptions<T>): UseInfiniteSelectSingleReturn<T> {
  const [accumulatedItems, setAccumulatedItems] = useState<T[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSearching, setIsSearching] = useState(false);
  
  // Use refs for tracking state to avoid dependency issues
  const lastPageRef = useRef(0);
  const lastSearchTermRef = useRef("");
  const prevAccumulatedCountRef = useRef(0);
  const isProcessingRef = useRef(false);
  const lastProcessedDataRef = useRef<{
    page: number;
    searchTerm: string;
    itemsCount: number;
  }>({
    page: 0,
    searchTerm: "",
    itemsCount: 0,
  });

  // Stable references to prevent infinite loops
  const getIdRef = useRef(getId);
  const onPageChangeRef = useRef(onPageChange);
  const onSearchChangeRef = useRef(onSearchChange);

  // Update refs on each render
  getIdRef.current = getId;
  onPageChangeRef.current = onPageChange;
  onSearchChangeRef.current = onSearchChange;

  // Create stable identifier for currentPageItems based on content, not reference
  // This prevents infinite loops when array reference changes but content is same
  const currentItemsKey = useMemo(() => {
    if (currentPageItems.length === 0) return 'empty';
    // Use getIdRef to avoid getId function reference causing recalculation
    // Include a hash of the items to detect content changes (not just ID changes)
    const ids = currentPageItems.map(item => getIdRef.current(item)).join(',');
    // Create a simple hash from stringified items to detect updates
    const contentHash = JSON.stringify(currentPageItems).length;
    return `${currentPageItems.length}-${ids}-${contentHash}`;
  }, [currentPageItems]);

  // Track when page or search changes to manage state properly
  useEffect(() => {
    // Prevent infinite loops during processing
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    // 1. Handle search term change - reset everything
    if (searchTerm !== lastSearchTermRef.current) {
      lastSearchTermRef.current = searchTerm;
      lastPageRef.current = 1;
      lastProcessedDataRef.current = { 
        page: 0, 
        searchTerm, 
        itemsCount: 0 
      };
      setIsSearching(searchTerm.length > 0);
      
      // If we already have data for page 1, process it immediately
      // This handles the case where data is cached (e.g., clearing search returns to initial state)
      if (page === 1 && currentPageItems.length > 0) {
        setAccumulatedItems(currentPageItems);
        prevAccumulatedCountRef.current = currentPageItems.length;
        lastProcessedDataRef.current = {
          page: 1,
          searchTerm,
          itemsCount: currentPageItems.length,
        };
      }
      
      isProcessingRef.current = false;
      return;
    }

    // 2. Handle page change
    if (page !== lastPageRef.current) {
      lastPageRef.current = page;

      if (currentPageItems.length > 0) {
        if (page === 1) {
          setAccumulatedItems(currentPageItems);
          prevAccumulatedCountRef.current = currentPageItems.length;
          lastProcessedDataRef.current = {
            page,
            searchTerm,
            itemsCount: currentPageItems.length,
          };
        } else {
          setAccumulatedItems((prev) => {
            const existingIds = new Set(
              prev.map((item) => getIdRef.current(item))
            );
            const newItems = currentPageItems.filter(
              (item) => !existingIds.has(getIdRef.current(item))
            );
            const result = [...prev, ...newItems];
            prevAccumulatedCountRef.current = result.length;
            return result;
          });
          lastProcessedDataRef.current = {
            page,
            searchTerm,
            itemsCount: currentPageItems.length,
          };
        }
      }
      isProcessingRef.current = false;
      return;
    }

    // 3. Handle data arriving after state has been set (late API responses)
    // OR when we have currentPageItems but accumulatedItems is empty (initial load from cache)
    // OR when the data has changed (different query parameters like activeQaTypeId)
    if (currentPageItems.length > 0) {
      const alreadyProcessed =
        lastProcessedDataRef.current.page === page &&
        lastProcessedDataRef.current.searchTerm === searchTerm &&
        lastProcessedDataRef.current.itemsCount === currentPageItems.length;

      // Check if the first item ID has changed (data refresh detected)
      const firstItemChanged =
        accumulatedItems.length > 0 &&
        currentPageItems.length > 0 &&
        getIdRef.current(accumulatedItems[0]) !== getIdRef.current(currentPageItems[0]);

      // Check if any item content has changed (updates to existing items)
      const contentChanged = page === 1 && accumulatedItems.length > 0 && currentPageItems.length > 0 && (() => {
        // Compare first few items to detect content changes
        const compareCount = Math.min(3, currentPageItems.length, accumulatedItems.length);
        for (let i = 0; i < compareCount; i++) {
          const currentId = getIdRef.current(currentPageItems[i]);
          const accumulatedId = getIdRef.current(accumulatedItems[i]);
          if (currentId === accumulatedId) {
            // Same ID, check if content is different by comparing stringified version
            if (JSON.stringify(currentPageItems[i]) !== JSON.stringify(accumulatedItems[i])) {
              return true;
            }
          }
        }
        return false;
      })();

      // Force processing if accumulatedItems is empty OR first item changed OR searchTerm doesn't match
      const searchTermMismatch = lastProcessedDataRef.current.searchTerm !== searchTerm;
      
      // If we're on page 1 and the current data is different from accumulated data, replace it
      const isPage1WithDifferentData = 
        page === 1 && 
        accumulatedItems.length > 0 && 
        currentPageItems.length > 0 &&
        (firstItemChanged || contentChanged);
      
      const needsProcessing =
        !alreadyProcessed || 
        accumulatedItems.length === 0 || 
        firstItemChanged || 
        searchTermMismatch ||
        isPage1WithDifferentData ||
        contentChanged;

      if (needsProcessing) {
        if (page === 1) {
          // Late data for page 1 or initial load or data refresh
          setAccumulatedItems(currentPageItems);
          prevAccumulatedCountRef.current = currentPageItems.length;
          lastProcessedDataRef.current = {
            page,
            searchTerm,
            itemsCount: currentPageItems.length,
          };
        } else {
          // Late data for page 2+
          setAccumulatedItems((prev) => {
            const existingIds = new Set(
              prev.map((item) => getIdRef.current(item))
            );
            const newItems = currentPageItems.filter(
              (item) => !existingIds.has(getIdRef.current(item))
            );

            if (newItems.length > 0) {
              const result = [...prev, ...newItems];
              prevAccumulatedCountRef.current = result.length;
              lastProcessedDataRef.current = {
                page,
                searchTerm,
                itemsCount: currentPageItems.length,
              };
              return result;
            } else {
              lastProcessedDataRef.current = {
                page,
                searchTerm,
                itemsCount: currentPageItems.length,
              };
            }
            return prev;
          });
        }
      }
    } else if (page === 1 && currentPageItems.length === 0) {
      // If we're on page 1 and API returned no items, clear accumulated
      // This handles the case where API response arrives with empty results (after restore/delete)
      const alreadyProcessed =
        lastProcessedDataRef.current.page === 1 &&
        lastProcessedDataRef.current.searchTerm === searchTerm &&
        lastProcessedDataRef.current.itemsCount === 0;

      if (!alreadyProcessed && !isLoading) {
        setAccumulatedItems([]);
        prevAccumulatedCountRef.current = 0;
        lastProcessedDataRef.current = { page: 1, searchTerm, itemsCount: 0 };
      }
    }

    isProcessingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItemsKey, page, searchTerm, isLoading]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      onPageChangeRef.current(page + 1);
    }
  }, [page, isLoading, hasMore]);

  // Search handler
  const handleSearch = useCallback((searchTerm: string) => {
    // Don't clear accumulated items immediately to prevent blinking
    onSearchChangeRef.current(searchTerm);
    onPageChangeRef.current(1);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setAccumulatedItems([]);
    setIsSearching(false);
    lastPageRef.current = 0;
    lastSearchTermRef.current = "";
    prevAccumulatedCountRef.current = 0;
    lastProcessedDataRef.current = { page: 0, searchTerm: "", itemsCount: 0 };
    onPageChangeRef.current(1);
    onSearchChangeRef.current("");
  }, []);

  return {
    accumulatedItems,
    handleLoadMore,
    handleSearch,
    resetState,
  };
}
