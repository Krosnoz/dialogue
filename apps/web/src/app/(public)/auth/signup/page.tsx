"use client";

import { AuthHero } from "@/components/auth/auth-hero";
import { PasswordInput } from "@/components/auth/password-input";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { authClient } from "@dialogue/auth/client";
import { useForm } from "@tanstack/react-form";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import z from "zod/v4";

export default function SignUpPage() {
	const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await signUp(value.email, value.password, value.name);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
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
			<div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">
				<div className="w-full max-w-md space-y-8">
					<div className="mb-8 text-center lg:hidden">
						<h1 className="font-bold text-3xl text-foreground">Dialogue</h1>
					</div>

					<div className="text-center">
						<h2 className="mb-2 font-bold text-3xl text-foreground">
							Create Account
						</h2>
						<p className="text-muted-foreground">
							Join us and start your AI conversation journey
						</p>
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
								Sign up with Google
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
								Sign up with GitHub
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
								<form.Field name="name">
									{(field) => (
										<div>
											<Label
												htmlFor={field.name}
												className="font-medium text-foreground text-sm"
											>
												Full Name
											</Label>
											<div className="relative mt-1">
												<Input
													id={field.name}
													name={field.name}
													type="text"
													autoComplete="name"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													className="pl-10"
													placeholder="Enter your full name"
												/>
												<User className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
											</div>
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

								<form.Field name="email">
									{(field) => (
										<div>
											<Label
												htmlFor={field.name}
												className="font-medium text-foreground text-sm"
											>
												Email Address
											</Label>
											<div className="relative mt-1">
												<Input
													id={field.name}
													name={field.name}
													type="email"
													autoComplete="email"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													className="pl-10"
													placeholder="Enter your email"
												/>
												<Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
											</div>
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
											placeholder="Create a password"
											autoComplete="new-password"
											errors={field.state.meta.errors
												.map((error) => error?.message)
												.filter((message): message is string =>
													Boolean(message),
												)}
											iconLeft={<Lock className="h-4 w-4" />}
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
										{state.isSubmitting
											? "Creating account..."
											: "Create Account"}
									</Button>
								)}
							</form.Subscribe>
						</form>

						<div className="text-center">
							<p className="text-muted-foreground text-sm">
								Already have an account?{" "}
								<Link
									href="/auth/signin"
									className="font-medium text-primary transition-colors hover:text-primary/80"
								>
									Sign in instead
								</Link>
							</p>
						</div>

						<div className="text-balance text-center text-muted-foreground text-xs">
							By creating an account, you agree to our Terms of Service and
							Privacy Policy.
						</div>
					</div>
				</div>
			</div>

			<AuthHero
				title="Join Dialogue"
				description="Experience the future of AI conversations. Create meaningful dialogues and unlock endless possibilities."
				features={[
					"AI-powered conversations",
					"Real-time collaboration",
					"Advanced language models",
					"Secure data handling",
					"Cross-platform access",
					"Intuitive interface",
				]}
			/>
		</div>
	);
}
