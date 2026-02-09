"use client";

import { useBooks } from "@/hooks/useBooks";
import { Book } from "@/lib/db";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, Plus, BookOpen, GraduationCap, MapPin, Search } from "lucide-react";
import { Dropdown } from "@/components/dropdown";

export default function AdminDashboard() {
    const { books, addBook, removeBook } = useBooks();
    const [newBook, setNewBook] = useState<Partial<Book>>({
        title: "",
        grade: "Grade 10",
        pages: 0,
        pdfUrl: "/sample.pdf",
        level: "1",
        subject: "Science",
        language: "English"
    });

    // Student Reporting State
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedSector, setSelectedSector] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("");

    // Mock Location Data
    const LOCATION_DATA: any = {
        "Maharashtra": {
            "Pune": {
                "Sector 1": ["School A", "School B"],
                "Sector 2": ["School C"]
            },
            "Mumbai": {
                "Sector A": ["School D", "School E"]
            }
        },
        "Gujarat": {
            "Ahmedabad": {
                "Sector X": ["School F", "School G"]
            },
            "Surat": {
                "Sector Y": ["School H"]
            }
        }
    };

    // Derived Options
    const stateOptions = Object.keys(LOCATION_DATA).map(s => ({ value: s, label: s }));
    const cityOptions = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}).map(c => ({ value: c, label: c })) : [];
    const sectorOptions = selectedCity ? Object.keys(LOCATION_DATA[selectedState]?.[selectedCity] || {}).map(s => ({ value: s, label: s })) : [];
    const schoolOptions = selectedSector ? (LOCATION_DATA[selectedState]?.[selectedCity]?.[selectedSector] || []).map((s: string) => ({ value: s, label: s })) : [];

    // Reset logic
    const handleStateChange = (val: string) => {
        setSelectedState(val);
        setSelectedCity("");
        setSelectedSector("");
        setSelectedSchool("");
    };
    const handleCityChange = (val: string) => {
        setSelectedCity(val);
        setSelectedSector("");
        setSelectedSchool("");
    };
    const handleSectorChange = (val: string) => {
        setSelectedSector(val);
        setSelectedSchool("");
    };

    // Mock Student Data
    const STUDENT_DATA = [
        { id: 1, name: "Aarav Patel", age: 15, school: "School A", booksRead: 12 },
        { id: 2, name: "Diya Sharma", age: 14, school: "School A", booksRead: 8 },
        { id: 3, name: "Vivaan Singh", age: 15, school: "School B", booksRead: 15 },
        { id: 4, name: "Ananya Gupta", age: 16, school: "School F", booksRead: 20 },
        { id: 5, name: "Rohan Kumar", age: 14, school: "School A", booksRead: 5 },
    ];

    const filteredStudents = selectedSchool ? STUDENT_DATA.filter(s => s.school === selectedSchool) : [];

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newBook.title && newBook.pages) {
            await addBook({
                title: newBook.title,
                grade: newBook.grade || "Grade 10",
                pages: Number(newBook.pages),
                pdfUrl: newBook.pdfUrl || "/sample.pdf",
                level: newBook.level || "1",
                subject: newBook.subject || "Science",
                language: newBook.language || "English"
            } as Book);
            setNewBook({
                title: "",
                grade: "Grade 10",
                pages: 0,
                pdfUrl: "/sample.pdf",
                level: "1",
                subject: "Science",
                language: "English"
            });
        }
    };

    // Mock Data for Charts
    const schoolData = [
        { name: 'School A', booksRead: 450 },
        { name: 'School B', booksRead: 320 },
        { name: 'School C', booksRead: 510 },
        { name: 'School D', booksRead: 290 },
    ];

    const districtData = [
        { name: 'District 1', activeStudent: 1200 },
        { name: 'District 2', activeStudent: 980 },
        { name: 'District 3', activeStudent: 1450 },
    ]

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
                <p className="text-gray-500">Welcome back, Admin</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<BookOpen className="text-blue-500" />} label="Total Books" value={books?.length || 0} />
                <StatCard icon={<GraduationCap className="text-green-500" />} label="Active Students" value="3,450" />
                <StatCard icon={<MapPin className="text-orange-500" />} label="Schools Reached" value="128" />
                <StatCard icon={<MapPin className="text-purple-500" />} label="Districts" value="12" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold mb-6">Books Read by School</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={schoolData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="booksRead" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold mb-6">Active Students by District</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={districtData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="activeStudent" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Student Reporting Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-500" />
                        Student Reports
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    {/* Cascading Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Dropdown
                            label="Select State"
                            options={stateOptions}
                            value={selectedState}
                            onChange={handleStateChange}
                            className="w-full"
                        />
                        <Dropdown
                            label="Select City"
                            options={cityOptions}
                            value={selectedCity}
                            onChange={handleCityChange}
                            className="w-full"
                        />
                        <Dropdown
                            label="Select Sector"
                            options={sectorOptions}
                            value={selectedSector}
                            onChange={handleSectorChange}
                            className="w-full"
                        />
                        <Dropdown
                            label="Select School"
                            options={schoolOptions}
                            value={selectedSchool}
                            onChange={setSelectedSchool}
                            className="w-full"
                        />
                    </div>

                    {/* Student Data Table */}
                    {selectedSchool && (
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="p-4">Student Name</th>
                                        <th className="p-4">Age</th>
                                        <th className="p-4">School</th>
                                        <th className="p-4 text-right">Books Read</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{student.name}</td>
                                            <td className="p-4 text-gray-500">{student.age}</td>
                                            <td className="p-4 text-gray-500">{student.school}</td>
                                            <td className="p-4 text-right font-bold text-blue-600">{student.booksRead}</td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">
                                                No students found for this school.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!selectedSchool && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 border border-dashed border-gray-300">
                            Please select a school to view student data.
                        </div>
                    )}
                </div>
            </section>

            {/* Book Management */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Book Management</h3>
                </div>

                <div className="p-6 grid gap-8 lg:grid-cols-3">
                    {/* Add Book Form */}
                    <div className="lg:col-span-1 space-y-4">
                        <h4 className="font-medium text-sm text-gray-500 uppercase">Add New Book</h4>
                        <form onSubmit={handleAddBook} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Book Title"
                                className="w-full p-2 border rounded"
                                value={newBook.title}
                                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    className="p-2 border rounded"
                                    value={newBook.grade}
                                    onChange={(e) => setNewBook({ ...newBook, grade: e.target.value })}
                                >
                                    <option>Grade 9</option>
                                    <option>Grade 10</option>
                                    <option>Grade 11</option>
                                    <option>Grade 12</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Pages"
                                    className="p-2 border rounded"
                                    value={newBook.pages || ''}
                                    onChange={(e) => setNewBook({ ...newBook, pages: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    className="p-2 border rounded"
                                    value={newBook.level}
                                    onChange={(e) => setNewBook({ ...newBook, level: e.target.value })}
                                >
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                    <option value="4">Level 4</option>
                                </select>
                                <select
                                    className="p-2 border rounded"
                                    value={newBook.subject}
                                    onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })}
                                >
                                    <option value="Science">Science</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="History">History</option>
                                </select>
                            </div>
                            <select
                                className="w-full p-2 border rounded"
                                value={newBook.language}
                                onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Marathi">Marathi</option>
                            </select>

                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add Book
                            </button>
                        </form>
                    </div>

                    {/* Book List */}
                    <div className="lg:col-span-2">
                        <h4 className="font-medium text-sm text-gray-500 uppercase mb-4">Existing Books</h4>
                        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-3">Title</th>
                                        <th className="p-3">Details</th>
                                        <th className="p-3">Lang</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {books?.map((book) => (
                                        <tr key={book.id}>
                                            <td className="p-3 font-medium">{book.title}</td>
                                            <td className="p-3 text-gray-500">
                                                {book.subject} • Level {book.level} • {book.grade}
                                            </td>
                                            <td className="p-3 text-gray-500">{book.language}</td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => book.id && removeBook(book.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {books?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">No books found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    )
}
