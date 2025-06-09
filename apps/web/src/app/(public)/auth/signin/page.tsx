"use client";

import { AuthHero } from "@/components/auth/auth-hero";
import { PasswordInput } from "@/components/auth/password-input";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { authClient } from "@dialogue/auth/client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import z from "zod/v4";

const getSignInMethodBadge = (method: string | null) => {
	switch (method) {
		case "google":
			return (
				<Badge variant="secondary" className="mb-4">
					Last signed in with Google
				</Badge>
			);
		case "github":
			return (
				<Badge variant="secondary" className="mb-4">
					Last signed in with GitHub
				</Badge>
			);
		case "email":
			return (
				<Badge variant="secondary" className="mb-4">
					Last signed in with Email
				</Badge>
			);
		default:
			return null;
	}
};

export default function SignInPage() {
	const { signIn, signInWithGoogle, signInWithGitHub, lastSignInMethod } =
		useAuth();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "admin@dialogue.fr",
			password: "Dialogue2025",
		},
		onSubmit: async ({ value }) => {
			await signIn(value.email, value.password);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen">
			<AuthHero
				title="Get back to work"
				description="Sign in to conversation and unlock the full potential of AI-powered Dialogue."
				features={[
					"Seamless conversation management",
					"Advanced AI capabilities",
					"Streaming conversations",
					"Syntax highlighting",
					"Markdown support",
					"Secure and private",
				]}
			/>

			<div className="flex w-full items-center justify-center p-8 lg:w-1/2">
				<div className="w-full max-w-md space-y-8">
					<div className="mb-8 text-center lg:hidden">
						<h1 className="font-bold text-3xl text-foreground">Dialogue</h1>
					</div>

					<div className="text-center">
						<h2 className="mb-2 font-bold text-3xl text-foreground">
							Welcome Back
						</h2>
						<p className="text-muted-foreground">
							Sign in to your account to continue
						</p>
						{getSignInMethodBadge(lastSignInMethod)}
					</div>

					<div className="space-y-6">
						<div className="space-y-4">
							<Button
								variant="outline"
								className="w-full"
								onClick={signInWithGoogle}
								type="button"
							>
								<svg
									role="img"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									fill="currentColor"
								>
									<title>Google</title>
									<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
								</svg>
								Sign in with Google
							</Button>
							<Button
								variant="outline"
								className="w-full"
								onClick={signInWithGitHub}
								type="button"
							>
								<svg
									role="img"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									fill="currentColor"
								>
									<title>GitHub</title>
									<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
								</svg>
								Sign in with GitHub
							</Button>
						</div>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-border border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
							className="space-y-6"
						>
							<div className="space-y-4">
								<form.Field name="email">
									{(field) => (
										<div>
											<Label
												htmlFor={field.name}
												className="font-medium text-foreground text-sm"
											>
												Email address
											</Label>
											<Input
												id={field.name}
												name={field.name}
												type="email"
												autoComplete="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="mt-1"
												placeholder="Enter your email"
											/>
											{field.state.meta.errors.map((error) => (
												<p
													key={error?.message}
													className="mt-1 text-destructive text-sm"
												>
													{error?.message}
												</p>
											))}
										</div>
									)}
								</form.Field>

								<form.Field name="password">
									{(field) => (
										<PasswordInput
											id={field.name}
											name={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											label="Password"
											placeholder="Enter your password"
											autoComplete="current-password"
											errors={field.state.meta.errors
												.map((error) => error?.message)
												.filter((msg): msg is string => Boolean(msg))}
										/>
									)}
								</form.Field>
							</div>

							<form.Subscribe>
								{(state) => (
									<Button
										type="submit"
										disabled={!state.canSubmit || state.isSubmitting}
										className="w-full"
									>
										{state.isSubmitting ? "Signing in..." : "Sign in"}
									</Button>
								)}
							</form.Subscribe>
						</form>

						<div className="text-center">
							<p className="text-muted-foreground text-sm">
								Don't have an account?{" "}
								<Link
									href="/auth/signup"
									className="font-medium text-primary transition-colors hover:text-primary/80"
								>
									Create one now
								</Link>
							</p>
						</div>

						<div className="text-balance text-center text-muted-foreground text-xs">
							By clicking continue, you agree to our Terms of Service and
							Privacy Policy.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
