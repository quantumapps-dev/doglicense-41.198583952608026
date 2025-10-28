"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Search, Calendar, CheckCircle, Clock, XCircle, User, Dog, FileText } from "lucide-react"
import { toast } from "sonner"

interface ApplicationData {
  applicationId: string
  formData: {
    ownerFirstName: string
    ownerLastName: string
    ownerEmail: string
    ownerPhone: string
    dogName: string
    dogBreed: string
    dogAge: number
    dogGender: string
    spayedNeutered: string
  }
  status: string
  submittedAt: string
}

export default function TrackApplication() {
  const [applicationId, setApplicationId] = useState("")
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [isSearched, setIsSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  const searchApplication = () => {
    if (!applicationId.trim()) {
      toast.error("Please enter an application ID")
      return
    }

    if (!isClient) {
      toast.error("Please wait while the page loads")
      return
    }

    setIsLoading(true)
    setIsSearched(true)

    // Simulate API call delay
    setTimeout(() => {
      try {
        const storedApplication = localStorage.getItem(`application_${applicationId.trim()}`)
        if (storedApplication) {
          const parsedApp: ApplicationData = JSON.parse(storedApplication)
          setApplication(parsedApp)
          toast.success("Application found!")
        } else {
          setApplication(null)
          toast.error("Application not found")
        }
      } catch (error) {
        console.error("[v0] Error reading from localStorage:", error)
        setApplication(null)
        toast.error("Error retrieving application")
      }
      setIsLoading(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchApplication()
    }
  }

  const calculateFee = (spayedNeutered: string) => {
    return spayedNeutered === "Yes" ? 15 : 30
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Track Your Application</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter your application ID to check the current status
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900 dark:text-white">Find Your Application</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your unique application ID (e.g., DL-1234567890-ABC123)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="DL-1234567890-ABC123"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-center text-lg py-6 border-2 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={searchApplication}
              disabled={isLoading || !applicationId.trim() || !isClient}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Track Application
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {isSearched && (
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Searching for your application...</p>
                </div>
              ) : application ? (
                <div className="space-y-6">
                  {/* Application Found */}
                  <div className="border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Dog License Application
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Application ID:{" "}
                          <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                            {application.applicationId}
                          </span>
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(application.status)} flex items-center gap-1 px-3 py-1`}>
                        {getStatusIcon(application.status)}
                        {application.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    {/* Owner Information */}
                    <div className="mb-6 pb-6 border-b border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Owner Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Name:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {application.formData.ownerFirstName} {application.formData.ownerLastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Email:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{application.formData.ownerEmail}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{application.formData.ownerPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dog Information */}
                    <div className="mb-6 pb-6 border-b border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Dog className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Dog Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Name:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{application.formData.dogName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Breed:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{application.formData.dogBreed}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Age:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {application.formData.dogAge} years
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                          <p className="font-medium text-gray-900 dark:text-white">{application.formData.dogGender}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Spayed/Neutered:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {application.formData.spayedNeutered}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">License Fee:</span>
                          <p className="font-medium text-blue-600 dark:text-blue-400">
                            ${calculateFee(application.formData.spayedNeutered)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Application Details</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted: {formatDate(application.submittedAt)}</span>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="pt-6 border-t border-green-200 dark:border-green-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Application Timeline</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Application Submitted</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(application.submittedAt)}
                            </p>
                          </div>
                        </div>
                        {application.status !== "pending" && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Under Review</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Processing your application</p>
                            </div>
                          </div>
                        )}
                        {application.status === "completed" && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Application Approved</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Your license has been issued</p>
                            </div>
                          </div>
                        )}
                        {application.status === "rejected" && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Application Rejected</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Please contact support for details
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Application Not Found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    We couldn't find an application with ID:{" "}
                    <span className="font-mono font-medium">{applicationId}</span>
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">Please check:</p>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 text-left">
                      <li>✓ The application ID is correct</li>
                      <li>✓ You're using the same browser and device</li>
                      <li>✓ Browser storage hasn't been cleared</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        {!isSearched && (
          <Card className="mt-8 shadow-xl border-0 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p>• Application IDs are generated when you submit a new application</p>
              <p>• IDs follow the format: DL-[timestamp]-[random code]</p>
              <p>• Make sure you're using the same browser where you submitted</p>
              <p>• Applications are stored locally on your device</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
