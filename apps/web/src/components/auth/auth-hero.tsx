interface AuthHeroProps {
	title: string;
	description: string;
	features: string[];
}

export function AuthHero({ title, description, features }: AuthHeroProps) {
	return (
		<div className="relative hidden overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-8 text-white lg:flex lg:w-1/2">
			<div className="absolute inset-0 bg-black/20" />
			<div className="relative z-10 flex flex-col items-center justify-center text-center">
				<div className="mb-8 w-2/3">
					<h1 className="mb-4 font-bold text-4xl">{title}</h1>
					<p className="text-xl leading-relaxed opacity-90">{description}</p>
				</div>
				<div className="flex flex-col items-center justify-center space-y-4 text-sm opacity-80">
					{features.map((feature, index) => (
						<div key={index} className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-white" />
							<span>{feature}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
