"use client";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SendButton = ({ invoiceId }: { invoiceId: number }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (isSuccessful) {
      toast(`Invoice (#${String(invoiceId).padStart(6, "0")}) has been sent!`);

      router.refresh();
    }
  }, [isSuccessful, router]);

  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      // Fetch the generated PDF from your API
      const response = await fetch(`/list/invoices/${invoiceId}/pdf`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const { pdfBase64 } = await response.json();

      await fetch("/api/email", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: invoiceId,
          buffer: pdfBase64,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to send email");
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            console.log("Email sent successfully");
            setIsSuccessful(true);
          }
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
    } catch (error) {
      console.error("Error fetching API:", error);
    } finally {
      setIsLoading(false);
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
          <FontAwesomeIcon icon={faPaperPlane} className="text-white w-5" />
        )}
      </button>
    </>
  );
};

export default SendButton;
