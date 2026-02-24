"use client";

import { useBooks } from "@/hooks/useBooks";
import { Book, db, User } from "@/lib/db";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, Plus, BookOpen, GraduationCap, MapPin, Search, Cloud, Download, Loader2, LayoutDashboard } from "lucide-react";
import { Dropdown } from "@/components/dropdown";
import { fetchDriveFolder, getDirectDownloadUrl, DriveFile } from "@/lib/google-drive";
import Link from "next/link";


export default function AdminDashboard() {
    const { books, addBook, addBooks, removeBook } = useBooks();

    const [newBook, setNewBook] = useState<Partial<Book>>({
        title: "",
        grade: "Grade 10",
        pages: 0,
        pdfUrl: "/sample.pdf",
        level: "1",
        subject: "Science",
        language: "English",
        coverUrl: ""
    });

    // Google Drive Import State
    const [folderId, setFolderId] = useState("");
    const [scanResults, setScanResults] = useState<DriveFile[]>([]);
    const [scanning, setScanning] = useState(false);
    const [importing, setImporting] = useState(false);


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
                language: newBook.language || "English",
                coverUrl: newBook.coverUrl || ""
            } as Book);
            setNewBook({
                title: "",
                grade: "Grade 10",
                pages: 0,
                pdfUrl: "/sample.pdf",
                level: "1",
                subject: "Science",
                language: "English",
                coverUrl: ""
            });
        }
    };

    const handleScan = async () => {
        if (!folderId) return;
        setScanning(true);
        try {
            const id = folderId.includes('id=') ? folderId.split('id=')[1] : folderId.split('/').pop() || folderId;
            const files = await fetchDriveFolder(id);
            setScanResults(files);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setScanning(false);
        }
    };

    const handleImportAll = async () => {
        if (scanResults.length === 0) return;
        setImporting(true);
        try {
            const formattedBooks: Book[] = scanResults.map(file => ({
                title: file.name.replace(/\.pdf$/i, ""),
                grade: newBook.grade || "Grade 10",
                pages: 10, // Default placeholder
                pdfUrl: getDirectDownloadUrl(file.id),
                level: newBook.level || "1",
                subject: newBook.subject || "Science",
                language: newBook.language || "English"
            }));
            await addBooks(formattedBooks);
            setScanResults([]);
            setFolderId("");
            alert(`Successfully imported ${formattedBooks.length} books!`);
        } catch (error: any) {
            alert("Import failed: " + error.message);
        } finally {
            setImporting(false);
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

    // Real Student Data from Dexie
    const users = useLiveQuery(() => db.users.toArray()) || [];

    // Filter logic
    const filteredStudents = users.filter((user: User) => {
        const matchesSchool = selectedSchool ? user.school === selectedSchool : true;
        const matchesCity = selectedCity ? user.city === selectedCity : true;
        // Add other filters as needed
        return matchesSchool && matchesCity;
    });

    // ... (keep handleAddBook and other functions)

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
                <p className="text-gray-500">Welcome back, Admin</p>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/admin/analytics" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Analytics</h3>
                        <p className="text-sm text-gray-500 mt-1">View reports & insights</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<BookOpen className="text-blue-500" />} label="Total Books" value={books?.length || 0} />
                <StatCard icon={<GraduationCap className="text-green-500" />} label="Active Students" value={users.length} />
                <StatCard icon={<MapPin className="text-orange-500" />} label="Schools Reached" value={selectedSchool ? 1 : "All"} />
                <StatCard icon={<MapPin className="text-purple-500" />} label="Cities" value={selectedCity ? 1 : "All"} />
            </div>

            {/* Charts Section - Keep usage of mock data for charts for now as we don't have enough real data points yet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ... charts ... */}
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
                        Student Reports (Real Data)
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
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="p-4">Student Name</th>
                                    <th className="p-4">Age</th>
                                    <th className="p-4">School</th>
                                    <th className="p-4">City</th>
                                    <th className="p-4">Mobile</th>
                                    <th className="p-4 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map((student: User) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{student.name}</td>
                                        <td className="p-4 text-gray-500">{student.age}</td>
                                        <td className="p-4 text-gray-500">{student.school}</td>
                                        <td className="p-4 text-gray-500">{student.city}</td>
                                        <td className="p-4 text-gray-500">{student.mobile || '-'}</td>
                                        <td className="p-4 text-right font-bold text-green-600 px-2 py-1 rounded bg-green-50 inline-block mt-2">{student.totalPoints}</td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                            <input
                                type="text"
                                placeholder="Cover Page Google Drive Link (Optional)"
                                className="w-full p-2 border rounded"
                                value={newBook.coverUrl || ''}
                                onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
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

            {/* Google Drive Import Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-500" />
                        Google Drive Batch Import
                    </h3>
                    <p className="text-xs text-gray-400">Import multiple PDFs from a public folder</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste Google Drive Folder ID or Link"
                            className="flex-1 p-2 border rounded"
                            value={folderId}
                            onChange={(e) => setFolderId(e.target.value)}
                        />
                        <button
                            onClick={handleScan}
                            disabled={scanning || !folderId}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Scan Folder
                        </button>
                    </div>

                    {scanResults.length > 0 && (
                        <div className="space-y-4">
                            <div className="max-h-60 overflow-y-auto border rounded-lg bg-gray-50">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-2">File Name</th>
                                            <th className="p-2 text-right">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {scanResults.map((file) => (
                                            <tr key={file.id}>
                                                <td className="p-2">{file.name}</td>
                                                <td className="p-2 text-right text-gray-400">PDF</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="text-sm text-blue-700">
                                    Found <strong>{scanResults.length}</strong> PDF files.
                                    They will be imported with the default settings (Subject: {newBook.subject}, Grade: {newBook.grade}).
                                </div>
                                <button
                                    onClick={handleImportAll}
                                    disabled={importing}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                                >
                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    Import All
                                </button>
                            </div>
                        </div>
                    )}
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
