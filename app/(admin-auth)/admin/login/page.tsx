"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, ShieldCheck } from "lucide-react"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true)
        try {
            // Use admin-credentials provider from main NextAuth
            const result = await signIn("admin-credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            })

            if (result?.error) {
                toast({
                    title: "Error",
                    description: "Invalid admin credentials",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: "Welcome to Admin Panel!",
                })
                router.push("/admin")
                router.refresh()
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
                    <CardDescription className="text-slate-400">
                        Sign in to access the admin panel
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-400">{errors.password.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In to Admin"
                            )}
                        </Button>
                        <p className="text-xs text-center text-slate-500">
                            This is a secure admin area. Unauthorized access is prohibited.
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
