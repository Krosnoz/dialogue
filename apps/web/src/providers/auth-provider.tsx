"use client";

import type { auth } from "@dialogue/auth";
import { authClient } from "@dialogue/auth/client";
import { useRouter } from "next/navigation";
import {
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";

type Session = typeof auth.$Infer.Session;

type SignInMethod = "email" | "google" | "github";

interface AuthContextType {
	user: Session["user"] | null;
	signOut: () => void;
	signIn: (email: string, password: string) => Promise<void>;
	signInWithGoogle: () => Promise<void>;
	signInWithGitHub: () => Promise<void>;
	signUp: (email: string, password: string, name: string) => Promise<void>;
	isLoading: boolean;
	lastSignInMethod: SignInMethod | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
type AuthProviderProps = PropsWithChildren<{
	isPublic?: boolean;
}>;

export const AuthProvider = ({
	children,
	isPublic = false,
}: AuthProviderProps) => {
	const router = useRouter();
	const [user, setUser] = useState<Session["user"] | null>(null);
	const [hasSessionBeenChecked, setHasSessionBeenChecked] =
		useState<boolean>(false);
	const [lastSignInMethod, setLastSignInMethod] = useState<SignInMethod | null>(
		null,
	);
	const { data: authContext, isPending } = authClient.useSession();

	useEffect(() => {
		const savedMethod = localStorage.getItem(
			"lastSignInMethod",
		) as SignInMethod | null;
		setLastSignInMethod(savedMethod);
	}, []);

	useEffect(() => {
		if (!isPending) {
			if (authContext) {
				if (isPublic) {
					router.push("/");
					return;
				}
				if (!user && authContext.user) {
					setUser({ ...authContext.user });
					setHasSessionBeenChecked(true);
				}
			} else if (!isPublic) {
				router.push("/auth/signin");
			} else {
				setHasSessionBeenChecked(true);
			}
		}
	}, [isPending, authContext, user, router, isPublic]);

	const updateSignInMethod = useCallback((method: SignInMethod) => {
		setLastSignInMethod(method);
		localStorage.setItem("lastSignInMethod", method);
	}, []);

	const signIn = useCallback(
		async (email: string, password: string) => {
			try {
				await authClient.signIn.email(
					{
						email,
						password,
					},
					{
						onSuccess: () => {
							updateSignInMethod("email");
							router.push("/");
							toast.success("Sign in successful");
						},
						onError: (error) => {
							toast.error(error.error.message);
						},
					},
				);
			} catch (error) {
				console.error(error);
			}
		},
		[router, updateSignInMethod],
	);

	const signInWithGoogle = useCallback(async () => {
		try {
			await authClient.signIn.social(
				{
					provider: "google",
					callbackURL: process.env.NEXT_PUBLIC_APP_URL,
				},
				{
					onSuccess: () => {
						updateSignInMethod("google");
					},
					onError: (error) => {
						toast.error(
							error.error?.message || "Failed to sign in with Google",
						);
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error("Failed to sign in with Google");
		}
	}, [updateSignInMethod]);

	const signInWithGitHub = useCallback(async () => {
		try {
			await authClient.signIn.social(
				{
					provider: "github",
					callbackURL: process.env.NEXT_PUBLIC_APP_URL,
				},
				{
					onSuccess: () => {
						updateSignInMethod("github");
					},
					onError: (error) => {
						toast.error(
							error.error?.message || "Failed to sign in with GitHub",
						);
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error("Failed to sign in with GitHub");
		}
	}, [updateSignInMethod]);

	const signUp = useCallback(
		async (email: string, password: string, name: string) => {
			await authClient.signUp.email(
				{
					email,
					password,
					name,
				},
				{
					onSuccess: () => {
						updateSignInMethod("email");
						router.push("/");
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message);
					},
				},
			);
		},
		[router, updateSignInMethod],
	);

	const signOut = useCallback(async () => {
		await authClient.signOut().catch(console.error);
		router.push("/auth/signin");
	}, [router]);

	const authContextValue = useMemo(
		() => ({
			user,
			signOut,
			signIn,
			signInWithGoogle,
			signInWithGitHub,
			signUp,
			isLoading: isPending,
			lastSignInMethod,
		}),
		[
			user,
			signOut,
			isPending,
			signIn,
			signInWithGoogle,
			signInWithGitHub,
			signUp,
			lastSignInMethod,
		],
	);

	if (!hasSessionBeenChecked) {
		return null;
	}

	return (
		<AuthContext.Provider value={authContextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
