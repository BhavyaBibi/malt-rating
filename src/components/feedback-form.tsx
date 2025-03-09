"use client"
import React, { Suspense, useEffect, useState } from 'react'
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

export default function FeedbackForm() {
  const [name, setName] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState("")
  const [manager, setManager] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [comment, setComment] = useState("")
  const [ratingError, setRatingError] = useState("")

  useEffect(() => {
    // If email is empty, clear data and show an error
    if (!email) {
      setCompanies([])
      setName("")
      setEmailError("Email is required")
      return
    }

    // Clear previous error message when user types a new email
    setEmailError("")

    // Debounce API call by 500ms
    const debounceTimer = setTimeout(() => {
      setLoading(true)
      const encodedEmail = btoa(email)
      const backendUrl = `https://script.google.com/macros/s/AKfycbzmniJj43dF-jJa-bNbhr6m0Ns8VOEe8szGghJ0ZSObhVCfmGnRCt3JLTcckT9HRo0E/exec?email=${encodedEmail}`

      fetch(backendUrl)
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          // Check if data is valid and contains meetings
          if (data && data.delegate_meetings && data.delegate_meetings.length > 0) {
            const meetings = data.delegate_meetings
            const fetchedCompanies = meetings.map((meeting: any, index: number) => ({
              id: index + 1,
              name: meeting,
              rating: null,
            }))
            setCompanies(fetchedCompanies)
            setName(data.name || "")
            setCompany(data.company || "")
            setManager(data.manager || "")
            setEmailError("")
          } else {
            setCompanies([])
            setName("")
            setEmailError("Email not found")
          }
        })
        .catch((error) => {
          console.error("Error fetching companies:", error)
          setCompanies([])
          setName("")
          setEmailError("Error fetching data")
        })
        .finally(() => setLoading(false))
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [email])

  const handleRatingChange = (companyId: number, rating: number) => {
    setCompanies(companies.map((comp) =>
      comp.id === companyId ? { ...comp, rating } : comp
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    if (!email) {
      setEmailError("Email is required")
      return
    } else {
      setEmailError("")
    }

    // Validate that all companies have been rated
    if (companies.some(company => company.rating === null)) {
      setRatingError("Please rate all companies before submitting.")
      return
    } else {
      setRatingError("")
    }

    setLoading(true)
    const encodedEmail = btoa(email)
    const payload = {
      email: encodedEmail,
      delegate_meetings: companies,
      comment: comment,
      company: company,
      manager: manager,
      name: name,
    }

    try {
      await fetch("https://script.google.com/macros/s/AKfycbzmniJj43dF-jJa-bNbhr6m0Ns8VOEe8szGghJ0ZSObhVCfmGnRCt3JLTcckT9HRo0E/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      })
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setLoading(false)
      setIsSubmitted(true)
    }
  }

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
    <div className="flex flex-col h-screen container mx-auto px-auto py-auto xl:py-6 max-w-2xl">
      <header className="flex-shrink-0">
        <div className="bg-cover bg-center h-48 xl:rounded-t-xl" 
             style={{ backgroundImage: "url('/Backdrop-4704_x_1344_-2.jpg')", backgroundSize: "cover" }}>
        </div>
        <div className="relative flex items-center justify-center text-white font-bold"
             style={{ backgroundImage: "url('/title-back.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="p-4 rounded text-2xl">
            MALT Congress - Meetings Feedback
          </div>
        </div>
      </header>

      <main className='flex-grow overflow-y-auto'>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              {emailError && <div className="text-red-500 text-sm mt-1">{emailError}</div>}
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
          <div className="mt-8 overflow-hidden">
          {loading ? (
  <div className="flex justify-center items-center">
    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
  </div>
) : (
  <Suspense fallback={<div className="text-black">Loading companies...</div>}>
    <table className="w-full">
      <tbody>
        {companies.map((comp, index) => (
          <tr
            key={comp.id}
            className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-300'} transition duration-300 ease-in-out transform hover:scale-105`}
          >
            <td className="p-4 text-center font-bold">{comp.id}</td>
            <td className="p-4 font-bold text-sm">{comp.name}</td>
            <td className="p-4">
              <div className="flex justify-end space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(comp.id, star)}
                    className="focus:outline-none cursor-pointer"
                  >
                    <Star className={`h-6 w-6 ${(comp.rating || 0) >= star ? 'fill-amber-800 text-amber-800' : 'text-amber-800'}`} />
                  </button>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Suspense>
)}

          </div>

          {/* Modern error message for unrated companies */}
          {ratingError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-4">
              {ratingError}
            </div>
          )}
        </CardContent>

        <CardContent>
          <div className="mt-4">
            <Label htmlFor="comment" className="font-bold">
              Any Comment
            </Label>
            <textarea
              id="comment"
              className="mt-1 w-full p-2 border rounded"
              placeholder="Enter your comments here"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
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
      </Card></main>
    </div>
  )
}
