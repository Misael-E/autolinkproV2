"use client";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SendButton = ({ invoiceId }: { invoiceId: number }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		if (isLoading) {
			toast(
				`Invoice (#${String(invoiceId).padStart(
					6,
					"0"
				)}) has been sent!`
			);

			router.refresh();
		}
	}, [isLoading, router]);

	const handleButtonClick = async () => {
		setIsLoading(true);
		try {
			// Fetch the generated PDF from your API
			const response = await fetch(`/list/invoice/${invoiceId}/pdf`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to generate PDF");
			}

			const pdfBlob = await response.blob(); // Convert to Blob
			const pdfBuffer = await pdfBlob.arrayBuffer(); // Convert to ArrayBuffer
			const pdfBase64 = Buffer.from(pdfBuffer).toString("base64"); // Convert to Base64

			await fetch("/api/email", {
				method: "POST",
				body: JSON.stringify({
					invoiceId: invoiceId,
					pdfBase64,
				}),
			});
		} catch (error) {
			console.error("Error fetching API:", error);
		}
	};

	return (
		<>
			<button
				onClick={handleButtonClick}
				className="w-7 h-7 flex items-center justify-center rounded-full bg-aztecGreen"
				disabled={isLoading}
			>
				{isLoading ? (
					<span className="text-white">...</span>
				) : (
					<FontAwesomeIcon
						icon={faPaperPlane}
						className="text-white w-5"
					/>
				)}
			</button>
		</>
	);
};

export default SendButton;
