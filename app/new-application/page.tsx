"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Upload, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  ownerFirstName: z.string().min(2, "First name must be at least 2 characters"),
  ownerLastName: z.string().min(2, "Last name must be at least 2 characters"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  ownerPhone: z
    .string()
    .regex(/^[\d\s\-().]+$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits"),
  ownerAddress: z.string().min(10, "Address must be at least 10 characters"),
  ownerCity: z.string().min(2, "City must be at least 2 characters"),
  ownerZipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
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

export default function NewApplication() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isClient, setIsClient] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const totalSteps = 4
  const spayedNeutered = watch("spayedNeutered")
  const licenseFee = spayedNeutered === "Yes" ? 15 : 30

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue("rabiesVaccination", e.target.files)

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

  const validateStep = async (step: number) => {
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

    const result = await trigger(fieldsToValidate)
    return result
  }

  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    } else {
      toast.error("Please fill in all required fields correctly")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = (data: FormData) => {
    if (!isClient) return

    const applicationId = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const applicationData = {
      id: applicationId,
      ...data,
      licenseFee,
      status: "Pending Payment",
      submittedAt: new Date().toISOString(),
      paymentStatus: "Unpaid",
    }

    try {
      const existingApplications = JSON.parse(localStorage.getItem("dogLicenseApplications") || "[]")
      existingApplications.push(applicationData)
      localStorage.setItem("dogLicenseApplications", JSON.stringify(existingApplications))

      toast.success("Application submitted successfully!")

      // Redirect to payment or track page
      setTimeout(() => {
        router.push(`/track-application?id=${applicationId}`)
      }, 1500)
    } catch (error) {
      toast.error("Failed to save application. Please try again.")
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm font-medium">
            <span className={currentStep >= 1 ? "text-blue-600" : "text-gray-500"}>Owner Info</span>
            <span className={currentStep >= 2 ? "text-blue-600" : "text-gray-500"}>Dog Details</span>
            <span className={currentStep >= 3 ? "text-blue-600" : "text-gray-500"}>Vaccination</span>
            <span className={currentStep >= 4 ? "text-blue-600" : "text-gray-500"}>Review & Pay</span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Dog License Application</CardTitle>
            <CardDescription>Complete all steps to apply for your dog license in Pennsylvania</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Owner Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerFirstName">First Name *</Label>
                      <Input id="ownerFirstName" {...register("ownerFirstName")} placeholder="John" />
                      {errors.ownerFirstName && <p className="text-sm text-red-600">{errors.ownerFirstName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerLastName">Last Name *</Label>
                      <Input id="ownerLastName" {...register("ownerLastName")} placeholder="Doe" />
                      {errors.ownerLastName && <p className="text-sm text-red-600">{errors.ownerLastName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Email Address *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      {...register("ownerEmail")}
                      placeholder="john.doe@example.com"
                    />
                    {errors.ownerEmail && <p className="text-sm text-red-600">{errors.ownerEmail.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Phone Number *</Label>
                    <Input id="ownerPhone" type="tel" {...register("ownerPhone")} placeholder="(555) 123-4567" />
                    {errors.ownerPhone && <p className="text-sm text-red-600">{errors.ownerPhone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerAddress">Street Address *</Label>
                    <Input id="ownerAddress" {...register("ownerAddress")} placeholder="123 Main Street" />
                    {errors.ownerAddress && <p className="text-sm text-red-600">{errors.ownerAddress.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerCity">City *</Label>
                      <Input id="ownerCity" {...register("ownerCity")} placeholder="Philadelphia" />
                      {errors.ownerCity && <p className="text-sm text-red-600">{errors.ownerCity.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerZipCode">ZIP Code *</Label>
                      <Input id="ownerZipCode" {...register("ownerZipCode")} placeholder="19019" maxLength={5} />
                      {errors.ownerZipCode && <p className="text-sm text-red-600">{errors.ownerZipCode.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dog Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="dogName">Dog's Name *</Label>
                    <Input id="dogName" {...register("dogName")} placeholder="Max" />
                    {errors.dogName && <p className="text-sm text-red-600">{errors.dogName.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dogBreed">Breed *</Label>
                      <Input id="dogBreed" {...register("dogBreed")} placeholder="Golden Retriever" />
                      {errors.dogBreed && <p className="text-sm text-red-600">{errors.dogBreed.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dogAge">Age (years) *</Label>
                      <Input id="dogAge" type="number" {...register("dogAge")} placeholder="3" min="0" max="25" />
                      {errors.dogAge && <p className="text-sm text-red-600">{errors.dogAge.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dogGender">Gender *</Label>
                      <Select onValueChange={(value) => setValue("dogGender", value as "Male" | "Female")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.dogGender && <p className="text-sm text-red-600">{errors.dogGender.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dogColor">Primary Color *</Label>
                      <Input id="dogColor" {...register("dogColor")} placeholder="Golden" />
                      {errors.dogColor && <p className="text-sm text-red-600">{errors.dogColor.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spayedNeutered">Spayed/Neutered? *</Label>
                    <Select onValueChange={(value) => setValue("spayedNeutered", value as "Yes" | "No")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.spayedNeutered && <p className="text-sm text-red-600">{errors.spayedNeutered.message}</p>}
                    <p className="text-sm text-gray-600">
                      License fee: ${spayedNeutered === "Yes" ? "15" : "30"} (Spayed/Neutered dogs receive a discount)
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rabies Vaccination</h3>

                  <div className="space-y-2">
                    <Label htmlFor="rabiesVaccination">Vaccination Certificate *</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="rabiesVaccination"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-gray-500" />
                    </div>
                    {errors.rabiesVaccination && (
                      <p className="text-sm text-red-600">{errors.rabiesVaccination.message}</p>
                    )}
                    <p className="text-sm text-gray-600">Upload PDF or image file (JPG, PNG)</p>
                    {filePreview && (
                      <div className="mt-4">
                        <img
                          src={filePreview || "/placeholder.svg"}
                          alt="Vaccination certificate preview"
                          className="max-w-md rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rabiesExpirationDate">Expiration Date *</Label>
                    <Input id="rabiesExpirationDate" type="date" {...register("rabiesExpirationDate")} />
                    {errors.rabiesExpirationDate && (
                      <p className="text-sm text-red-600">{errors.rabiesExpirationDate.message}</p>
                    )}
                    <p className="text-sm text-gray-600">Must be a future date</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">PA State Requirements</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Valid rabies vaccination required</li>
                      <li>• Certificate must show expiration date</li>
                      <li>• Vaccination must be current</li>
                      <li>• Annual renewal required</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Payment</h3>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Owner Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {watch("ownerFirstName")} {watch("ownerLastName")}
                        <br />
                        {watch("ownerEmail")}
                        <br />
                        {watch("ownerPhone")}
                        <br />
                        {watch("ownerAddress")}, {watch("ownerCity")}, PA {watch("ownerZipCode")}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Dog Information</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Name: {watch("dogName")}
                        <br />
                        Breed: {watch("dogBreed")}
                        <br />
                        Age: {watch("dogAge")} years
                        <br />
                        Gender: {watch("dogGender")}
                        <br />
                        Color: {watch("dogColor")}
                        <br />
                        Spayed/Neutered: {watch("spayedNeutered")}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vaccination</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Expiration Date: {watch("rabiesExpirationDate")}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">License Fee:</span>
                        <span className="text-2xl font-bold text-blue-600">${licenseFee}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {spayedNeutered === "Yes" ? "Discounted rate for spayed/neutered dogs" : "Standard license fee"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Ready to Submit</h4>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Your application will be saved and you'll receive an application ID to track your status.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto bg-blue-600 hover:bg-blue-700">
                    Submit Application
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
