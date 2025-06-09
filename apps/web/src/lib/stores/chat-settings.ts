import type { LLMProvider } from "@dialogue/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ChatSettingsState {
	selectedProvider: LLMProvider;
	selectedModel: string;
	apiKeys: Record<LLMProvider, string | undefined>;
	setSelectedProvider: (provider: LLMProvider) => void;
	setSelectedModel: (model: string) => void;
	setApiKey: (provider: LLMProvider, apiKey: string | undefined) => void;
}

export const useChatSettingsStore = create<ChatSettingsState>()(
	persist(
		(set) => ({
			selectedProvider: "openai",
			selectedModel: "gpt-4o",
			apiKeys: {
				openai: undefined,
				anthropic: undefined,
				google: undefined,
			},
			setSelectedProvider: (provider) => set({ selectedProvider: provider }),
			setSelectedModel: (model) => set({ selectedModel: model }),
			setApiKey: (provider, apiKey) =>
				set((state) => ({
					apiKeys: {
						...state.apiKeys,
						[provider]: apiKey,
					},
				})),
		}),
		{
			name: "chat-settings-store",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
