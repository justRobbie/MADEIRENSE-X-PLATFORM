export function nextPageTriggerSetup<Element = globalThis.Element>({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    rootMargin = "100px",
    threshold = 0.1
}: {
    fetchNextPage: Function;
    hasNextPage: boolean;
    isFetching: boolean;
    isFetchingNextPage: boolean;
    rootMargin?: `${number}px`;
    threshold?: number;
}) {
    return (node: Element | null) => {
        if (isFetchingNextPage) return;

        let observer: IntersectionObserver;

        if (node) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasNextPage && !isFetching) {
                        fetchNextPage();
                    }
                },
                {
                    threshold,
                    rootMargin
                }
            );

            observer.observe(node as any);
        }

        return () => {
            if (observer && node) {
                observer.unobserve(node as any);
            }
        };
    };
};