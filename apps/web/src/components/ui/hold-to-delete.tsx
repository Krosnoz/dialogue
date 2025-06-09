"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface HoldToDeleteProps {
	children: React.ReactNode;
	onDelete: () => void;
	className?: string;
	holdDuration?: number;
}

export function HoldToDelete({
	children,
	onDelete,
	className,
	holdDuration = 2000,
}: HoldToDeleteProps) {
	const [isHolding, setIsHolding] = useState(false);
	const [hasCompleted, setHasCompleted] = useState(false);
	const [progress, setProgress] = useState(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const handleMouseDown = useCallback(() => {
		if (hasCompleted) return;

		setIsHolding(true);
		setProgress(0);

		const startTime = Date.now();
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
			setProgress(newProgress);
		}, 16);

		timeoutRef.current = setTimeout(() => {
			setHasCompleted(true);
			setProgress(100);
			onDelete();

			animationTimeoutRef.current = setTimeout(() => {
				setIsHolding(false);
				setHasCompleted(false);
				setProgress(0);
			}, 200);
		}, holdDuration);
	}, [onDelete, holdDuration, hasCompleted]);

	const handleMouseUp = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		setIsHolding(false);
		setProgress(0);
	}, []);

	const handleMouseLeave = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		setIsHolding(false);
		setProgress(0);
	}, []);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div
			className={cn(
				"relative inline-flex cursor-pointer select-none transition-colors",
				isHolding && "text-popover-foreground",
				className,
			)}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
			onTouchStart={handleMouseDown}
			onTouchEnd={handleMouseUp}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleMouseDown();
				}
			}}
			onKeyUp={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleMouseUp();
				}
			}}
			aria-label="Hold to delete"
		>
			{isHolding && (
				<div
					className="absolute inset-0 rounded-md bg-destructive transition-all duration-75 ease-out"
					style={{
						clipPath: `inset(0 ${100 - progress}% 0 0)`,
					}}
					aria-hidden="true"
				/>
			)}

			<div className="relative z-10">{children}</div>
		</div>
	);
}
