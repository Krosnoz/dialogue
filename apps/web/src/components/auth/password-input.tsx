"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
	id: string;
	name: string;
	value: string;
	onChange: (value: string) => void;
	onBlur: () => void;
	placeholder?: string;
	autoComplete?: string;
	label: string;
	errors?: string[];
	iconLeft?: React.ReactNode;
}

export function PasswordInput({
	id,
	name,
	value,
	onChange,
	onBlur,
	placeholder = "Enter your password",
	autoComplete = "current-password",
	label,
	errors = [],
	iconLeft,
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div>
			<Label htmlFor={id} className="font-medium text-foreground text-sm">
				{label}
			</Label>
			<div className="relative mt-1">
				<Input
					id={id}
					name={name}
					type={showPassword ? "text" : "password"}
					autoComplete={autoComplete}
					value={value}
					onBlur={onBlur}
					onChange={(e) => onChange(e.target.value)}
					className={`block w-full rounded-lg border-input shadow-sm ${iconLeft ? "pl-10" : ""} pr-10`}
					placeholder={placeholder}
				/>
				{iconLeft && (
					<div className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground">
						{iconLeft}
					</div>
				)}
				<button
					type="button"
					className="absolute inset-y-0 right-0 flex items-center pr-3"
					onClick={() => setShowPassword(!showPassword)}
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4 text-muted-foreground" />
					) : (
						<Eye className="h-4 w-4 text-muted-foreground" />
					)}
				</button>
			</div>
			{errors.map((error) => (
				<p key={error} className="mt-1 text-destructive text-sm">
					{error}
				</p>
			))}
		</div>
	);
}
