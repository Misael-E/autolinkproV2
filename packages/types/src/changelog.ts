export type ChangelogEntry = {
	version: string;
	date: string;
	sections: {
		title: string;
		items: string[];
	}[];
};

export const changelog: ChangelogEntry[] = [
	{
		version: "0.3.0",
		date: "March 16, 2026",
		sections: [
			{
				title: "Features",
				items: [
					'Added Quotes which you can create in the quotes page or appointments form through the "Generate Quote" button',
					"Added Pricing Bank for storing reusable service and pricing templates",
				],
			},
			{
				title: "Improvements",
				items: [
					"Updated role-based access controls for admin and member roles",
					"Ability to edit values in the pricing bank directly by hovering over the item and clicking the pencil edit button",
				],
			},
			{
				title: "Bug Fixes",
				items: ["Fixed service pill display on invoice and quote detail views"],
			},
		],
	},
	{
		version: "0.2.0",
		date: "February 10, 2026",
		sections: [
			{
				title: "Features",
				items: [
					"Added Statements module with PDF export",
					"Added Billing module for admin users",
					"Added Expense tracking",
				],
			},
			{
				title: "Improvements",
				items: [
					"Removed unnecessary path revalidation to improve navigation performance",
				],
			},
			{
				title: "Bug Fixes",
				items: [
					"Fixed invoice status not updating after payment",
					"Fixed customer search returning duplicate results",
				],
			},
		],
	},
	{
		version: "0.1.0",
		date: "January 5, 2026",
		sections: [
			{
				title: "Features",
				items: [
					"Initial release",
					"Dashboard with revenue charts, finance summaries, and event calendar",
					"Customer and Employee management",
					"Appointment and Booking system",
					"Invoice creation and PDF export",
					"Service management",
				],
			},
		],
	},
];
