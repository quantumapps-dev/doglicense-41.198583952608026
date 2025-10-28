"use client"

import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Plus, Search, Shield, FileCheck, CreditCard, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Dog License Application</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Official Pennsylvania State Dog Licensing Portal - Register your dog, process applications, and track status
            online
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          <Card className="hover:shadow-xl transition-all bg-white dark:bg-gray-800 border-0 shadow-lg hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Plus className="w-5 h-5 text-blue-600" />
                New License Application
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Register your dog and apply for a new license
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/new-application">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Application
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all bg-white dark:bg-gray-800 border-0 shadow-lg hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Search className="w-5 h-5 text-green-600" />
                Track Application
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Check the status of your submitted application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/track-application">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <Search className="w-4 h-4 mr-2" />
                  Track Status
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Register</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Fill out the online application with your dog's information
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Upload Documents</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Provide proof of rabies vaccination certificate
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Pay Fee</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Complete payment based on spay/neuter status</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4. Track Status</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Monitor your application progress online</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Pennsylvania State Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>All dogs must be licensed in compliance with PA state law</p>
              </div>
              <div className="flex items-start gap-2">
                <FileCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Valid rabies vaccination certificate required</p>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>License fees: $15 (spayed/neutered) or $30 (not spayed/neutered)</p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Annual renewal required to maintain active license status</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
