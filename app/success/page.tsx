import type { Metadata } from "next";
import SuccessContent from "./SuccessContent";

export const metadata: Metadata = {
  title: "Message Sent | Dr. Sunday Okafor",
  description: "Your message to Dr. Sunday Okafor has been sent successfully.",
};

export default function SuccessPage() {
  return <SuccessContent />;
}
