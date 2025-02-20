"use client";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SendButton = ({ invoiceId }: { invoiceId: number }) => {
	const [state, setState] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		if (state) {
			toast(
				`Invoice (#${String(invoiceId).padStart(
					6,
					"0"
				)}) has been sent!`
			);

			router.refresh();
		}
	}, [state, router]);

	const handleButtonClick = async () => {
		try {
			await fetch("/api/email", {
				method: "POST",
				body: JSON.stringify({
					invoiceId: invoiceId,
				}),
			});

			setState(true);
		} catch (error) {
			setState(false);
			console.error("Error fetching API:", error);
		}
	};

	return (
		<>
			<button
				onClick={handleButtonClick}
				className="w-7 h-7 flex items-center justify-center rounded-full bg-aztecGreen"
			>
				<FontAwesomeIcon
					icon={faPaperPlane}
					className="text-white w-5"
				/>
			</button>
		</>
	);
};

export default SendButton;
