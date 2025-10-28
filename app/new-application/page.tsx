"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, CheckCircle, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  ownerFirstName: z.string().min(2, "First name must be at least 2 characters"),
  ownerLastName: z.string().min(2, "Last name must be at least 2 characters"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  ownerPhone: z
    .string()
    .regex(/^$$?([0-9]{3})$$?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Please enter a valid phone number"),
  ownerAddress: z.string().min(10, "Address must be at least 10 characters"),
  ownerCity: z.string().min(2, "City must be at least 2 characters"),
  ownerZipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
  dogName: z.string().min(1, "Dog name is required"),
  dogBreed: z.string().min(2, "Breed must be at least 2 characters"),
  dogAge: z.coerce.number().min(0, "Age must be at least 0").max(25, "Age must be 25 or less"),
  dogGender: z.enum(["Male", "Female"], { required_error: "Please select a gender" }),
  dogColor: z.string().min(3, "Color must be at least 3 characters"),
  spayedNeutered: z.enum(["Yes", "No"], { required_error: "Please select an option" }),
  rabiesVaccination: z.any().refine((files) => files?.length > 0, "Rabies vaccination certificate is required"),
  rabiesExpirationDate: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate > today
  }, "Expiration date must be in the future"),
})

type FormData = z.infer<typeof formSchema>

const steps = [
  { id: 1, title: "Owner Information", description: "Your contact details" },
  { id: 2, title: "Dog Information", description: "Details about your dog" },
  { id: 3, title: "Vaccination Records", description: "Required documentation" },
  { id: 4, title: "Payment", description: "Complete your application" },
]

export default function NewApplication() {
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerAddress: "",
      ownerCity: "",
      ownerZipCode: "",
      dogName: "",
      dogBreed: "",
      dogAge: 0,
      dogGender: undefined,
      dogColor: "",
      spayedNeutered: undefined,
      rabiesVaccination: undefined,
      rabiesExpirationDate: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (isClient && applicationId) {
      const savedData = localStorage.getItem(`application_${applicationId}`)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        form.reset(parsed.formData)
      }
    }
  }, [isClient, applicationId, form])

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = [
          "ownerFirstName",
          "ownerLastName",
          "ownerEmail",
          "ownerPhone",
          "ownerAddress",
          "ownerCity",
          "ownerZipCode",
        ]
        break
      case 2:
        fieldsToValidate = ["dogName", "dogBreed", "dogAge", "dogGender", "dogColor", "spayedNeutered"]
        break
      case 3:
        fieldsToValidate = ["rabiesVaccination", "rabiesExpirationDate"]
        break
    }

    const result = await form.trigger(fieldsToValidate)
    return result
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
      saveToLocalStorage()
    } else {
      toast.error("Please fill in all required fields correctly")
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const saveToLocalStorage = () => {
    if (!isClient) return

    const formData = form.getValues()
    let appId = applicationId

    if (!appId) {
      appId = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      setApplicationId(appId)
    }

    const applicationData = {
      applicationId: appId,
      formData,
      status: "pending",
      submittedAt: new Date().toISOString(),
    }

    localStorage.setItem(`application_${appId}`, JSON.stringify(applicationData))

    // Also save to a list of all applications
    const allApps = JSON.parse(localStorage.getItem("all_applications") || "[]")
    const existingIndex = allApps.findIndex((app: any) => app.applicationId === appId)

    if (existingIndex >= 0) {
      allApps[existingIndex] = applicationData
    } else {
      allApps.push(applicationData)
    }

    localStorage.setItem("all_applications", JSON.stringify(allApps))
  }

  const onSubmit = (data: FormData) => {
    saveToLocalStorage()
    toast.success("Application submitted successfully!", {
      description: `Your application ID is: ${applicationId}`,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("rabiesVaccination", e.target.files)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  // Calculate license fee based on spay/neuter status
  const calculateFee = () => {
    const spayedNeutered = form.watch("spayedNeutered")
    return spayedNeutered === "Yes" ? 15 : 30
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dog License Application</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Pennsylvania State Dog Licensing</p>
          {applicationId && (
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">Application ID: {applicationId}</p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.id}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-1 mx-2 transition-colors",
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Owner Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ownerFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ownerLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ownerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ownerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="ownerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ownerCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Philadelphia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ownerZipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="19019" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Dog Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dogName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dog's Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Max" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dogBreed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breed *</FormLabel>
                            <FormControl>
                              <Input placeholder="Golden Retriever" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dogAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age (years) *</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="25" placeholder="3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dogGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dogColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color *</FormLabel>
                            <FormControl>
                              <Input placeholder="Golden" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="spayedNeutered"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is your dog spayed/neutered? *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            License fee: $
                            {form.watch("spayedNeutered") === "Yes"
                              ? "15"
                              : form.watch("spayedNeutered") === "No"
                                ? "30"
                                : "15/30"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Vaccination Records */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="rabiesVaccination"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Rabies Vaccination Certificate *</FormLabel>
                          <FormControl>
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} {...field} />
                          </FormControl>
                          <FormDescription>
                            Upload a PDF or image file of your dog's rabies vaccination certificate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {filePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <img
                          src={filePreview || "/placeholder.svg"}
                          alt="Vaccination certificate preview"
                          className="max-w-md rounded-lg border"
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="rabiesExpirationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vaccination Expiration Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>The expiration date must be in the future</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">PA State Requirements</h3>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Valid rabies vaccination required</li>
                        <li>• License must be renewed annually</li>
                        <li>• Fees vary by spay/neuter status</li>
                        <li>• Certificate must be current and valid</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step 4: Payment */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Application Summary</h3>
                        <DollarSign className="w-8 h-8 text-blue-600" />
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Owner:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {form.watch("ownerFirstName")} {form.watch("ownerLastName")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Dog:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {form.watch("dogName")} ({form.watch("dogBreed")})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Spayed/Neutered:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {form.watch("spayedNeutered")}
                          </span>
                        </div>
                        <div className="border-t border-blue-200 dark:border-blue-700 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">License Fee:</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              ${calculateFee()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> This is a demo application. No actual payment will be processed. In a
                        production environment, this would integrate with a payment processor.
                      </p>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Application & Pay ${calculateFee()}
                    </Button>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 4 && (
                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
