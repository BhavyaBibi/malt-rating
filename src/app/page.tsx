'use client'
import FeedbackForm from "@/components/feedback-form"
import { useEffect, useState } from "react"

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedEmail = urlParams.get("email");
    if (encodedEmail) {
      const decodedEmail = atob(encodedEmail);
      setEmail(decodedEmail);
    }
  }, []);

  return (
    <main className="min-h-screen bg-white w-full">
      <FeedbackForm email={email} />
    </main>
  )
}
