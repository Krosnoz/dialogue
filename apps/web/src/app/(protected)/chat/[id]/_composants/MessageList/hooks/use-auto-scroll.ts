import { useCallback, useEffect, useRef, useState } from "react";

import type { MessageListType, UnifiedMessage } from "@dialogue/types";

export const useAutoScroll = (
	messages: MessageListType | UnifiedMessage[] | undefined,
	isLoading: boolean,
) => {
	const scrollTargetRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [isUserAtBottom, setIsUserAtBottom] = useState(true);
	const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
		scrollTargetRef.current?.scrollIntoView({ behavior });
	}, []);

	const checkIfAtBottom = useCallback(() => {
		const container = scrollContainerRef.current;
		if (!container) return false;

		const { scrollTop, scrollHeight, clientHeight } = container;
		return scrollHeight - scrollTop - clientHeight <= 50;
	}, []);

	const clearStreamingInterval = useCallback(() => {
		if (streamingIntervalRef.current) {
			clearInterval(streamingIntervalRef.current);
			streamingIntervalRef.current = null;
		}
	}, []);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const handleScroll = () => setIsUserAtBottom(checkIfAtBottom());

		container.addEventListener("scroll", handleScroll, { passive: true });
		return () => container.removeEventListener("scroll", handleScroll);
	}, [checkIfAtBottom]);

	useEffect(() => {
		if (!messages?.length || !isUserAtBottom) {
			clearStreamingInterval();
			return;
		}

		const hasStreamingMessages = messages.some((msg) => msg.isStreaming);

		if (hasStreamingMessages) {
			clearStreamingInterval();
			streamingIntervalRef.current = setInterval(() => {
				scrollToBottom("smooth");
			}, 100);
		} else {
			clearStreamingInterval();
			scrollToBottom("instant");
		}

		return clearStreamingInterval;
	}, [messages, isUserAtBottom, scrollToBottom, clearStreamingInterval]);

	useEffect(() => {
		if (isUserAtBottom && !isLoading) {
			scrollToBottom("instant");
		}
	}, [isLoading, isUserAtBottom, scrollToBottom]);

	useEffect(() => {
		const timer = setTimeout(() => scrollToBottom("instant"), 100);
		return () => clearTimeout(timer);
	}, [scrollToBottom]);

	return { scrollTargetRef, scrollContainerRef };
};
