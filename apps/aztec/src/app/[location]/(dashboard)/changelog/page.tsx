import { changelog } from "@repo/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faClockRotateLeft,
	faWrench,
	faStar,
	faBug,
	faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

const sectionConfig: Record<
	string,
	{ dot: string; badge: string; icon: typeof faStar }
> = {
	Features: {
		dot: "bg-aztecGreen",
		badge: "bg-aztecGreen/10 text-aztecGreen border border-aztecGreen/20",
		icon: faStar,
	},
	Improvements: {
		dot: "bg-aztecBlue",
		badge: "bg-aztecBlue/10 text-aztecBlue border border-aztecBlue/20",
		icon: faArrowUp,
	},
	"Bug Fixes": {
		dot: "bg-aztecOrange",
		badge: "bg-aztecOrange/10 text-aztecOrange border border-aztecOrange/20",
		icon: faBug,
	},
};

const statConfig = [
	{
		key: "Features",
		label: "Features",
		icon: faStar,
		color: "text-aztecGreen",
		bg: "bg-aztecGreen/10",
		border: "border-aztecGreen/20",
	},
	{
		key: "Improvements",
		label: "Improvements",
		icon: faArrowUp,
		color: "text-aztecBlue",
		bg: "bg-aztecBlue/10",
		border: "border-aztecBlue/20",
	},
	{
		key: "Bug Fixes",
		label: "Bug Fixes",
		icon: faBug,
		color: "text-aztecOrange",
		bg: "bg-aztecOrange/10",
		border: "border-aztecOrange/20",
	},
];

const ChangelogPage = () => {
	// Compute totals
	const totals = statConfig.map((s) => ({
		...s,
		count: changelog.reduce((acc, entry) => {
			const section = entry.sections.find((sec) => sec.title === s.key);
			return acc + (section?.items.length ?? 0);
		}, 0),
	}));

	return (
		<div className="p-6 md:p-10 flex gap-8 flex-col lg:flex-row">
			{/* LEFT — Timeline */}
			<div className="flex-1 min-w-0">
				{/* Header */}
				<div className="mb-10">
					<div className="flex items-center gap-3 mb-2">
						<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-aztecBlue/10 border border-aztecBlue/20">
							<FontAwesomeIcon
								icon={faClockRotateLeft}
								className="text-aztecBlue w-4"
							/>
						</div>
						<h1 className="text-2xl font-bold text-white">Changelog</h1>
					</div>
					<p className="text-gray-500 text-sm ml-12">
						All updates, features, and fixes - newest first.
					</p>
				</div>

				{/* Timeline */}
				<div className="relative flex flex-col gap-0">
					<div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-700" />

					{changelog.map((entry, entryIdx) => {
						const isLatest = entryIdx === 0;
						const versionId = `v${entry.version.replace(/\./g, "-")}`;
						return (
							<div
								key={entry.version}
								id={versionId}
								className="relative flex gap-6 pb-10 scroll-mt-6">
								{/* Timeline dot */}
								<div
									className={`relative z-10 mt-1 w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 ${
										isLatest
											? "bg-aztecBlue border-aztecBlue shadow-[0_0_8px_rgba(17,148,228,0.5)]"
											: "bg-aztecBlack-dark border-gray-600"
									}`}
								/>

								{/* Card */}
								<div
									className={`flex-1 rounded-xl border bg-aztecBlack-dark overflow-hidden ${
										isLatest ? "border-aztecBlue/30" : "border-gray-700/60"
									}`}>
									{/* Card header */}
									<div
										className={`flex items-center justify-between px-5 py-3 border-b ${
											isLatest
												? "border-aztecBlue/20 bg-aztecBlue/5"
												: "border-gray-700/60"
										}`}>
										<div className="flex items-center gap-3">
											<span className="text-white font-bold text-base tracking-tight">
												v{entry.version}
											</span>
											{isLatest && (
												<span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-aztecBlue text-white">
													Latest
												</span>
											)}
										</div>
										<span className="text-gray-500 text-xs">{entry.date}</span>
									</div>

									{/* Sections */}
									<div className="px-5 py-4 flex flex-col gap-5">
										{entry.sections.map((section) => {
											const config = sectionConfig[section.title];
											return (
												<div key={section.title}>
													<span
														className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3 ${config?.badge ?? "text-gray-400 bg-gray-800 border border-gray-700"}`}>
														<FontAwesomeIcon
															icon={config?.icon ?? faWrench}
															className="w-2.5"
														/>
														{section.title}
													</span>
													<ul className="flex flex-col gap-2 ml-1">
														{section.items.map((item, idx) => (
															<li
																key={idx}
																className="flex items-start gap-2.5 text-sm text-gray-300">
																<span
																	className={`mt-[7px] w-1 h-1 rounded-full flex-shrink-0 ${config?.dot ?? "bg-gray-500"}`}
																/>
																{item}
															</li>
														))}
													</ul>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* RIGHT — Sidebar */}
			<div className="w-full lg:w-64 flex flex-col gap-4 flex-shrink-0">
				{/* Stats */}
				<div className="rounded-xl border border-gray-700/60 bg-aztecBlack-dark p-4">
					<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
						All-time totals
					</h2>
					<div className="flex flex-col gap-3">
						{totals.map((stat) => (
							<div key={stat.key} className="flex items-center gap-3">
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-lg border ${stat.bg} ${stat.border}`}>
									<FontAwesomeIcon
										icon={stat.icon}
										className={`w-3.5 ${stat.color}`}
									/>
								</div>
								<div className="flex-1">
									<p className="text-white text-sm font-semibold">
										{stat.count}
									</p>
									<p className="text-gray-500 text-xs">{stat.label}</p>
								</div>
							</div>
						))}
						<div className="border-t border-gray-700/60 pt-3 mt-1 flex items-center gap-3">
							<div className="flex items-center justify-center w-8 h-8 rounded-lg border bg-gray-700/20 border-gray-700">
								<FontAwesomeIcon
									icon={faClockRotateLeft}
									className="w-3.5 text-gray-400"
								/>
							</div>
							<div className="flex-1">
								<p className="text-white text-sm font-semibold">
									{changelog.length}
								</p>
								<p className="text-gray-500 text-xs">Versions</p>
							</div>
						</div>
					</div>
				</div>

				{/* Quick nav */}
				<div className="rounded-xl border border-gray-700/60 bg-aztecBlack-dark p-4">
					<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
						Jump to version
					</h2>
					<div className="flex flex-col gap-1">
						{changelog.map((entry, idx) => {
							const isLatest = idx === 0;
							const versionId = `v${entry.version.replace(/\./g, "-")}`;
							return (
								<a
									key={entry.version}
									href={`#${versionId}`}
									className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700/40 transition-colors group">
									<div className="flex items-center gap-2">
										<span
											className={`w-1.5 h-1.5 rounded-full ${isLatest ? "bg-aztecBlue" : "bg-gray-600"}`}
										/>
										<span className="text-sm text-gray-300 group-hover:text-white transition-colors">
											v{entry.version}
										</span>
										{isLatest && (
											<span className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-aztecBlue/20 text-aztecBlue border border-aztecBlue/20">
												Latest
											</span>
										)}
									</div>
									<span className="text-[11px] text-gray-600 group-hover:text-gray-400 transition-colors">
										{entry.date.split(" ").slice(2).join("")}
									</span>
								</a>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChangelogPage;
