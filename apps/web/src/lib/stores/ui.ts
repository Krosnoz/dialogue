import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
	sidebarOpen: boolean;
	theme: "light" | "dark" | "system";
	currentConversationId: string | null;
	streamingMessageId: string | null;

	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;
	setTheme: (theme: "light" | "dark" | "system") => void;
	setCurrentConversationId: (id: string | null) => void;
	setStreamingMessageId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			sidebarOpen: true,
			theme: "system",
			currentConversationId: null,
			streamingMessageId: null,

			toggleSidebar: () =>
				set((state) => ({ sidebarOpen: !state.sidebarOpen })),
			setSidebarOpen: (open) => set({ sidebarOpen: open }),
			setTheme: (theme) => set({ theme }),
			setCurrentConversationId: (id) => set({ currentConversationId: id }),
			setStreamingMessageId: (id) => set({ streamingMessageId: id }),
		}),
		{
			name: "ui-store",
			partialize: (state) => ({
				sidebarOpen: state.sidebarOpen,
				theme: state.theme,
			}),
		},
	),
);
