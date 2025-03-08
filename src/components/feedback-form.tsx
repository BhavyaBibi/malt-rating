"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Send, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import TopLoader from "nextjs-toploader"

interface Company {
  id: number
  name: string
  rating: number | null
}

interface FeedbackFormProps {
  email: string | null;
}

export default function FeedbackForm({ email }: FeedbackFormProps) {
  const [name, setName] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true) // Track data loading

  useEffect(() => {
    if (!email) {
      console.error("Email is required")
      return
    }

    setLoading(true) // Start loading
    const encodedEmail = btoa(email)
    const backendUrl = `https://script.google.com/macros/s/AKfycbzmniJj43dF-jJa-bNbhr6m0Ns8VOEe8szGghJ0ZSObhVCfmGnRCt3JLTcckT9HRo0E/exec?email=${encodedEmail}`;

    fetch(backendUrl)
      .then((response) => response.json())
      .then((data) => {
        const meetings = data.delegate_meetings;
        console.log(meetings);
        const fetchedCompanies = meetings.map((meeting: any, index: number) => ({
          id: index + 1,
          name: meeting,
          rating: null,
        }));
        setCompanies(fetchedCompanies);
        setName(data.name);
      })
      .catch((error) => console.error("Error fetching companies:", error))
      .finally(() => setLoading(false)); // Stop loading
  }, [email]);

  const handleRatingChange = (companyId: number, rating: number) => {
    setCompanies(companies.map((company) => (company.id === companyId ? { ...company, rating } : company)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading progress

    const encodedEmail = btoa(email || "");
    const payload = {
      email: encodedEmail,
      delegate_meetings: JSON.stringify(companies),
    };

    try {
      await fetch("https://script.google.com/macros/s/AKfycbzmniJj43dF-jJa-bNbhr6m0Ns8VOEe8szGghJ0ZSObhVCfmGnRCt3JLTcckT9HRo0E/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false); // Stop loading progress
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
            <CardDescription className="text-center">
              Your feedback has been submitted successfully.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-auto py-auto xl:py-6 max-w-2xl">

      <div className="bg-cover bg-center h-48  xl:rounded-t-xl" style={{ backgroundImage: "url('/Backdrop-4704_x_1344_-2.jpg')", backgroundSize: "cover" }}></div>
      <div className="relative flex items-center justify-center text-white font-bold " style={{ backgroundImage: "url('/title-back.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="p-4 rounded text-2xl">
          MALT Congress - Meetings Feedback
        </div>
      </div>

      <TopLoader showSpinner={false} />
      <Card className="rounded-t-none">
        <CardHeader className="pb-2">
          <div className="space-y-2">
            <div>
              <Label htmlFor="name" className="font-bold">
                Name of the representative
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email" className="font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email || ""}
                className="mt-1"
                disabled
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mt-4">
            <p className="font-bold">Please find below the list of clients you met during MALT Congress 2025.</p>
            <p className="text-sm italic mt-2">
              (Kindly rate on a basis of 1 to 5 - 1 being the lowest and 5 being the highest)
            </p>

          </div>

          <div className="mt-8  overflow-hidden">
            <table className="w-full">
              <tbody>
                {companies.map((company, index) => (
                  <tr key={company.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"}>
                    <td className="p-4 text-center font-bold">{company.id}</td>
                    <td className="p-4 font-bold text-sm">{company.name}</td>
                    <td className="p-4">
                      <div className="flex justify-end space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(company.id, star)}
                            className="focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`h-6 w-6 ${(company.rating || 0) >= star ? "fill-amber-800 text-amber-800" : "text-amber-800"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter>
            <Button onClick={handleSubmit} className="bg-black text-white hover:bg-amber-800 px-8 font-bold cursor-pointer">
            Submit
            </Button>
        </CardFooter>

        <CardContent>
          <p className="text-sm italic mt-1">
            This data is for internal purpose only and will not be shared with any third party.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

