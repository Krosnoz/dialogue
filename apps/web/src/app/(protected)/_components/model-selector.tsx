"use client";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useChatSettingsStore } from "@/lib/stores/chat-settings";
import { cn } from "@/lib/utils";
import { useTRPC } from "@dialogue/api/client";
import type { LLMProvider } from "@dialogue/types";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Key, Settings } from "lucide-react";
import { useState } from "react";

export function ModelSelector() {
	const trpc = useTRPC();
	const isMounted = useIsMounted();

	const {
		selectedProvider,
		selectedModel,
		apiKeys,
		setSelectedProvider,
		setSelectedModel,
		setApiKey,
	} = useChatSettingsStore();
	const { data: providersData } = useQuery(trpc.provider.list.queryOptions());

	const [open, setOpen] = useState(false);
	const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
	const [currentProvider, setCurrentProvider] = useState<LLMProvider | null>(
		null,
	);
	const [tempApiKey, setTempApiKey] = useState("");

	const handleSelect = (value: string) => {
		const [providerId, modelName] = value.split(":");
		setOpen(false);
		setSelectedProvider(providerId as LLMProvider);
		setSelectedModel(modelName);
	};

	const handleApiKeyClick = (provider: LLMProvider, e: React.MouseEvent) => {
		e.stopPropagation();
		setCurrentProvider(provider);
		setTempApiKey(apiKeys[provider] || "");
		setApiKeyDialogOpen(true);
	};

	const handleSaveApiKey = () => {
		if (currentProvider) {
			setApiKey(currentProvider, tempApiKey || undefined);
		}
		setApiKeyDialogOpen(false);
		setCurrentProvider(null);
		setTempApiKey("");
	};

	const handleRemoveApiKey = () => {
		if (currentProvider) {
			setApiKey(currentProvider, undefined);
		}
		setApiKeyDialogOpen(false);
		setCurrentProvider(null);
		setTempApiKey("");
	};

	if (!isMounted)
		return (
			<div className="flex h-full flex-col">
				<Skeleton className="h-9 w-[400px]" />
			</div>
		);

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						aria-expanded={open}
						className="w-[400px] justify-between"
					>
						<div className="flex items-center gap-2">
							{apiKeys[selectedProvider] && (
								<Key className="h-3 w-3 text-green-600" />
							)}
							{selectedProvider} - {selectedModel}
						</div>
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[400px] p-0">
					<Command>
						<CommandInput
							placeholder="Search providers and models..."
							className="h-9"
						/>
						<CommandList>
							<CommandEmpty>No providers or models found.</CommandEmpty>

							{providersData?.items &&
								providersData.items.length > 0 &&
								providersData.items.map((provider) => (
									<CommandGroup
										key={provider.id}
										heading={
											<div className="flex w-full items-center justify-between">
												<div className="flex items-center gap-2">
													{apiKeys[provider.id as LLMProvider] && (
														<Key className="h-3 w-3 text-green-600" />
													)}
													{provider.name}
												</div>
												<Button
													variant="ghost"
													size="sm"
													className="h-6 w-6 p-0 hover:bg-muted"
													onClick={(e) =>
														handleApiKeyClick(provider.id as LLMProvider, e)
													}
												>
													<Settings className="h-3 w-3" />
												</Button>
											</div>
										}
									>
										{provider &&
											provider.models.length > 0 &&
											provider.models.map((model) => (
												<CommandItem
													key={model}
													value={`${provider.id}:${model}`}
													onSelect={handleSelect}
												>
													{model}
													<Check
														className={cn(
															"ml-auto",
															selectedModel === model &&
																selectedProvider === provider.id
																? "opacity-100"
																: "opacity-0",
														)}
													/>
												</CommandItem>
											))}
									</CommandGroup>
								))}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			<Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>API Key for {currentProvider}</DialogTitle>
						<DialogDescription>
							Enter your API key for {currentProvider}. This will be stored
							locally and used for requests.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="apikey" className="text-right">
								API Key
							</Label>
							<Input
								id="apikey"
								type="password"
								value={tempApiKey}
								onChange={(e) => setTempApiKey(e.target.value)}
								className="col-span-3"
								placeholder="Enter your API key..."
							/>
						</div>
					</div>
					<DialogFooter>
						{apiKeys[currentProvider as LLMProvider] && (
							<Button variant="destructive" onClick={handleRemoveApiKey}>
								Remove
							</Button>
						)}
						<Button
							variant="outline"
							onClick={() => setApiKeyDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSaveApiKey}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
