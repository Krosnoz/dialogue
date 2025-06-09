"use client";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface SystemInstructionsDrawerProps {
	disabled: boolean;
	systemInstructions: string;
	onSystemInstructionsChange: (value: string) => void;
}

export function SystemInstructionsDrawer({
	disabled,
	systemInstructions,
	onSystemInstructionsChange,
}: SystemInstructionsDrawerProps) {
	const [innerSystemInstructions, setInnerSystemInstructions] =
		useState(systemInstructions);

	useEffect(() => {
		setInnerSystemInstructions(systemInstructions);
	}, [systemInstructions]);

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline" size="sm">
					<Settings className="mr-2 h-4 w-4" />
					System Instructions
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>System Instructions</DrawerTitle>
					<DrawerDescription>
						Enter system instructions to guide the AI's behavior and responses.
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-1 overflow-y-auto p-4">
					<Textarea
						placeholder="Enter system instructions to guide the AI's behavior..."
						value={innerSystemInstructions}
						onChange={(e) => setInnerSystemInstructions(e.target.value)}
						onBlur={(e) => onSystemInstructionsChange(e.target.value)}
						className="min-h-[200px] resize-none"
						disabled={disabled}
					/>
				</div>
				{!disabled && (
					<DrawerFooter>
						<DrawerClose asChild>
							<Button>Done</Button>
						</DrawerClose>
					</DrawerFooter>
				)}
			</DrawerContent>
		</Drawer>
	);
}
