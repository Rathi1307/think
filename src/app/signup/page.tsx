"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, User, Lock, ArrowRight, ArrowLeft, MapPin, School, Calendar, Phone } from "lucide-react";
import { db } from "@/lib/db";

import { useSync } from "@/hooks/useSync";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
    const router = useRouter();
    const { isOnline } = useSync();
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        mobile: "",
        city: "",
        school: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isOnline) {
            setError("You must be online to create a new account.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Simple ID generation
            const id = `student-${Date.now()}`;

            const userData = {
                id,
                name: formData.name,
                age: Number(formData.age),
                mobile: formData.mobile,
                city: formData.city,
                school: formData.school,
                password: formData.password, // Storing plain for demo parity, but in prod use Auth
                totalPoints: 0
            };

            // 1. Save to Cloud (Supabase) - Optional for Demo
            if (supabase) {
                try {
                    const { error: supabaseError } = await supabase
                        .from('users')
                        .insert([
                            {
                                id: userData.id,
                                name: userData.name,
                                age: userData.age,
                                city: userData.city,
                                school: userData.school,
                                mobile: userData.mobile,
                                password: userData.password,
                                totalPoints: 0
                            }
                        ]);

                    if (supabaseError) {
                        console.warn("Cloud sync failed:", supabaseError.message);
                        alert("Cloud Error: " + supabaseError.message); // Show error to user
                    } else {
                        console.log("Supabase insert successful!");
                    }
                } catch (cloudErr) {
                    console.warn("Cloud connection error (Demo Mode active):", cloudErr);
                }
            } else {
                console.warn("Cloud connection not configured. Saving locally only (Demo Mode).");
            }

            // 2. Save Local (Dexie)
            await db.users.add(userData);

            // Set as current local user
            // Clear previous session
            await db.users.delete('local-user');
            await db.users.put({
                ...userData,
                id: 'local-user'
            });

            // Redirect to dashboard
            router.push("/dashboard");

        } catch (err: any) {
            console.error("Signup failed", err);
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-4">

            {!isOnline && (
                <div className="absolute top-0 w-full bg-red-500 text-white text-center py-2 text-sm font-medium z-50">
                    You are currently offline. Please connect to the internet to sign up.
                </div>
            )}

            {/* Back to Home Link */}
            <div className="absolute top-6 left-6">
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors font-medium text-sm group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all my-8">

                {/* Header Section */}
                <div className="bg-green-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-green-700 opacity-20 transform -skew-y-6 origin-top-left"></div>

                    <div className="relative z-10">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 shadow-inner">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-wide">
                            Create Account
                        </h2>
                        <p className="text-green-100 text-sm mt-2 opacity-90">
                            Join ThinkSharp and start learning today!
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm text-black placeholder:text-gray-400"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        type="number"
                                        name="age"
                                        placeholder="Age"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm text-black placeholder:text-gray-400"
                                        value={formData.age}
                                        onChange={handleChange}
                                        required
                                        min="4"
                                        max="18"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        placeholder="Mobile Number"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm text-black placeholder:text-gray-400"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                        pattern="[0-9]{10}"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm text-black placeholder:text-gray-400"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">School Name</label>
                            <div className="relative group">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type="text"
                                    name="school"
                                    placeholder="Enter your school name"
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm text-black placeholder:text-gray-400"
                                    value={formData.school}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="******"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm text-black placeholder:text-gray-400"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="******"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm text-black placeholder:text-gray-400"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>


                        <button
                            type="submit"
                            disabled={!isOnline || isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-4"
                        >
                            {isLoading ? "Creating Account..." : (!isOnline ? "Offline - Connect to Sign Up" : "Create Account")}
                            {!isLoading && isOnline && <ArrowRight className="w-4 h-4" />}
                        </button>

                        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                            Already have an account? <Link href="/login" className="text-green-600 font-bold hover:underline">Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Note */}
            <p className="mt-8 text-xs text-gray-400 font-medium">
                &copy; 2024 ThinkSharp Foundation
            </p>

        </div>
    );
}
