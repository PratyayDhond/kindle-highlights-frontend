import Footer from "@/components/Footer";
import { version } from "os";

const whatsNewData = [
	{
		version: "v3.2.1",
		date: "2025-07-15",
		changes: [
			"Added Strict Punctuation and Show Quotes options in Book Online View -> View Filters.",
			"Added URL filtering to show highlighted working urls only from a book."
		]
		
	},
	{
		version: "v3.2.0",
		date: "2025-07-04",
		changes: [
			"Updated Redundant Highlights removal logic to avoid issue of overlapping dissimilar highlights.",
			"Added quick-navigation shortcut keys across app.",
			"Added Username display in dashboard",
			"Updated Newsletter message to show email address of user.",
			"Shortcut Keys: ",
			"`CTRL + F` to focus search bar",
			"`CTRL + SHIFT + Backspace` to go back from Book View to Dashboard",
			"`Enter` to Open book view when only 1 search result exists",
			"`SHIFT + D` to download book pdf when only 1 search result"
		]
	},
	{
		version: "v3.1.0",
		date: "2025-07-02",
		changes: [
			"Newsletter not sent now if no user highlights are available.",
			"Newsletter includes a dynamic highlight count if user has less than 10 highlights."
		]
	},
	{
		version: "v3.0.0 - Newsletter",
		date: "2025-07-01",
		changes: [
			"Added Newsletter feature.",
			"Users can now subscribe to newsletters.",
			"cron job to send newsletters every day.",
			"Newsletter consists of 10 random users highlights.",
			"Updated Header to be scrollable for mobile devices.",
			"Updated Home on Header to (Kindle Highlights -> Zip) tool.",
		]
	},
	{
		version: "v2.1.1",
		date: "2025-06-26",
		changes: [
			"Users can now switch to Google SSO login after setting initial email-password login.",
			"Notes are placed at the location they were created at",
			"Fixed Coins not being updated after highlights file uploaded from dashboard",
			"Added File hashing to check for duplicate file uploads by user.",
			"Added sample file for users without clippings.txt"
		]
	},
	{
		version: "v2.1.0",
		date: "2025-06-25",
		changes: [
			"Added User Stats Prop.",
			"Notes are now placed at the bottom of the page.",
			"Fixed Notes/Highlights missing for last highlight in a book.",
			"Fixed updating of Stats prop on reupload of same file."
		]
	},
	{
		version: "v2.0.0 - Dashboard",
		date: "2025-06-23",
		changes: [
			"Added Dashboard Page.",
			"Added Book Online View Page.",
			"Support for Individual Book Download.",
			"Added User Consent for Data Processing & Storage.",
			"Search functionality for Books and Highlights in a selected book.",
			"Added Coins Update Animation"
		]
	},
	{
		version: "v1.2.1",
		date: "2025-06-20",
		changes: [
			"DASHBOARD UI Improvements.",
			"Added Header for Navigation to different pages.",
		],
	},
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
		date: "2025-06-15",
		changes: ["Added Authentication Flow."],
	},
	{
		version: "v1.0.0 - Highlights Extractor",
		date: "2025-06-12",
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
		// bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30 This gives the gradient like look to the page background
		<div className="flex flex-col min-h-[89vh] bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30">
			<div className="flex-1 max-w-xl mx-auto py-10 px-4 w-full">
				<h1 className="text-3xl font-bold mb-8 text-center text-royal-700">
					What's New
				</h1>
				<div className="relative border-l-2 border-royal-300 pl-8 flex flex-col gap-12">
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
		</div>
	);
}