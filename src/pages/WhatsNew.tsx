import React from "react";

const whatsNewData = [
	{
		version: "v1.2.0",
		date: "2025-06-20",
		changes: [
			"Added What's New page with timeline.",
			"Added Coins System for Processing highlights.",
			"UI/UX Improvements.",
		],
	},
	{
		version: "v1.1.0",
		date: "2025-05-15",
		changes: ["Added Authentication Flow."],
	},
	{
		version: "v1.0.0",
		date: "2025-04-01",
		changes: [
			"File Upload & Processing.",
      "PDF Generation for Highlights.",
      "Switched to Processing highlights using HTML->PDF",
      "Added Privacy: Backend deletes data and does not generate zip file.",  
    ],
	},
  {
    version: "0.1.0 (BETA)",
    date: "2024-12-01",
    changes: [
      "Initial Release with basic features.",
      "Backend generates zip file.",
      "Processing highlights using MD->PDF via md-to-pdf library",
    ],
  },
];

export default function WhatsNew() {
	return (
		<div className="max-w-xl mx-auto py-10 px-4 min-h-[95vh]">
			<h1 className="text-3xl font-bold mb-8 text-center text-royal-700">
				What's New
			</h1>
			<div className="relative border-l-2 border-royal-300 pl-8 flex flex-col gap-12 max-h-[95vh] overflow-y-auto">
				{whatsNewData.map((entry, idx) => (
					<div key={entry.version} className="relative group">
						{/* Timeline dot */}
						<span className="absolute -left-5 top-2 w-4 h-4 rounded-full bg-royal-500 border-4 border-white shadow group-hover:scale-110 transition-transform"></span>
						<div className="bg-white rounded-lg shadow p-5">
							<h2 className="text-xl font-semibold text-royal-700 flex items-center gap-2">
								{entry.version}
								<span className="text-xs text-gray-400 font-normal">
									{entry.date}
								</span>
							</h2>
							<ul className="list-disc ml-6 mt-2 text-gray-700">
								{entry.changes.map((change, idx) => (
									<li key={idx}>{change}</li>
								))}
							</ul>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}