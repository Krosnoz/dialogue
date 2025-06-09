"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MessageContentProps {
	content: string;
	isStreaming?: boolean;
}

export const MessageContent = memo(function MessageContent({
	content,
}: MessageContentProps) {
	const { theme } = useTheme();

	const isMarkdownCodeBlock =
		content.trim().startsWith("```markdown") && content.trim().endsWith("```");

	if (isMarkdownCodeBlock) {
		const markdownContent = content.trim().slice(11, -3).trim();

		return (
			<div className="not-prose my-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
				<div className="flex items-center justify-between border-border border-b bg-muted/80 px-4 py-3">
					<span className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
						markdown
					</span>
				</div>
				<div className="relative">
					<SyntaxHighlighter
						style={theme === "dark" ? oneDark : oneLight}
						language="markdown"
						codeTagProps={{
							className: "text-foreground",
						}}
						PreTag="div"
						customStyle={{
							margin: "0",
							borderRadius: "0",
							fontSize: "0.875rem",
							background: "transparent !important",
							padding: "1.25rem",
							lineHeight: "1.6",
						}}
					>
						{markdownContent}
					</SyntaxHighlighter>
				</div>
			</div>
		);
	}

	return (
		<div className="prose dark:prose-invert prose-headings:mt-8 prose-headings:mb-4 max-w-none break-words prose-headings:font-bold prose-strong:font-semibold prose-strong:text-foreground prose-p:before:hidden prose-p:after:hidden">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					p({ children }) {
						return (
							<p className="mb-4 text-foreground leading-7 [&:not(:first-child)]:mt-4">
								{children}
							</p>
						);
					},
					h1({ children }) {
						return (
							<h1 className="mt-10 mb-6 border-border border-b pb-3 font-bold text-3xl text-foreground tracking-tight">
								{children}
							</h1>
						);
					},
					h2({ children }) {
						return (
							<h2 className="mt-8 mb-4 font-bold text-2xl text-foreground tracking-tight">
								{children}
							</h2>
						);
					},
					h3({ children }) {
						return (
							<h3 className="mt-6 mb-3 font-semibold text-foreground text-xl tracking-tight">
								{children}
							</h3>
						);
					},
					h4({ children }) {
						return (
							<h4 className="mt-6 mb-3 font-semibold text-foreground text-lg">
								{children}
							</h4>
						);
					},
					ul({ children }) {
						return (
							<ul className="mt-4 mb-6 ml-6 list-disc space-y-2 [&>li]:mt-2">
								{children}
							</ul>
						);
					},
					ol({ children }) {
						return (
							<ol className="mt-4 mb-6 ml-6 list-decimal space-y-2 [&>li]:mt-2">
								{children}
							</ol>
						);
					},
					li({ children }) {
						return (
							<li className="pl-2 text-foreground leading-7">{children}</li>
						);
					},
					blockquote({ children }) {
						return (
							<blockquote className="mt-6 mb-6 rounded-r-md border-primary/40 border-l-4 bg-muted/50 py-4 pr-4 pl-6 text-foreground/90 italic leading-7">
								{children}
							</blockquote>
						);
					},
					strong({ children }) {
						return (
							<strong className="font-semibold text-foreground">
								{children}
							</strong>
						);
					},
					em({ children }) {
						return <em className="text-foreground/90 italic">{children}</em>;
					},
					code({ node, className, children, ...props }) {
						const match = /language-(\w+)/.exec(className || "");
						const content = String(children);

						const isBlock =
							match ||
							content.includes("\n") ||
							className?.startsWith("language-");

						if (isBlock) {
							return (
								<pre className="not-prose my-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
									<div className="flex items-center justify-between border-border border-b bg-muted/80 px-4 py-3">
										<span className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
											{match?.[1] ?? "text"}
										</span>
									</div>
									<div className="relative">
										<SyntaxHighlighter
											style={theme === "dark" ? oneDark : oneLight}
											language={match?.[1] ?? "text"}
											codeTagProps={{
												className: "text-foreground",
											}}
											PreTag="div"
											customStyle={{
												margin: "0",
												borderRadius: "0",
												fontSize: "0.875rem",
												background: "transparent !important",
												padding: "1.25rem",
												lineHeight: "1.6",
											}}
										>
											{content.replace(/\n$/, "")}
										</SyntaxHighlighter>
									</div>
								</pre>
							);
						}

						return (
							<code
								className={cn(
									"relative rounded-md border border-border/60 bg-muted/80 px-2 py-1 font-medium font-mono text-foreground text-sm",
									className,
								)}
								{...props}
							>
								{children}
							</code>
						);
					},
					pre({ children }) {
						return <>{children}</>;
					},
					table({ children }) {
						return (
							<div className="my-8 overflow-x-auto rounded-lg border border-border">
								<table className="w-full border-collapse bg-card">
									{children}
								</table>
							</div>
						);
					},
					thead({ children }) {
						return <thead className="bg-muted/50">{children}</thead>;
					},
					th({ children }) {
						return (
							<th className="border-border border-b px-4 py-3 text-left font-semibold text-foreground text-sm">
								{children}
							</th>
						);
					},
					td({ children }) {
						return (
							<td className="border-border border-b px-4 py-3 text-foreground/90 text-sm">
								{children}
							</td>
						);
					},
					hr() {
						return <hr className="my-8 border-border" />;
					},
					a({ children, href }) {
						return (
							<a
								href={href}
								className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
								target="_blank"
								rel="noopener noreferrer"
							>
								{children}
							</a>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
});
