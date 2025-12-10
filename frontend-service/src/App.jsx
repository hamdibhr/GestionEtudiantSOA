import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- CONFIG ---
const AUTH_URL = 'http://localhost:8080/auth';
const GATEWAY_URL = 'http://localhost:8080';

// --- JWT DECODER ---
function parseJwt(token) {
    if (!token) return {};
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) { return {}; }
}

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(null);
    const [username, setUsername] = useState(null);
    const [view, setView] = useState('login');

    // NAVIGATION STATE
    const [activeTab, setActiveTab] = useState('students');
    const [selectedStudentId, setSelectedStudentId] = useState(''); // For the Redirect Logic

    useEffect(() => {
        if (token) {
            const decoded = parseJwt(token);
            setUserRole(decoded.role || 'STUDENT');
            setUsername(decoded.sub); // 'sub' is usually the username in JWT
            setView('dashboard');
        }
    }, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserRole(null);
        setView('login');
    };

    if (view === 'dashboard' && token) {
        return (
            <Dashboard
                token={token}
                role={userRole}
                username={username}
                logout={logout}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedStudentId={selectedStudentId}
                setSelectedStudentId={setSelectedStudentId}
            />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96 border-t-4 border-blue-600">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">University Portal 🎓</h1>
                {view === 'login' ? <LoginForm setToken={setToken} setView={setView} /> : <RegisterForm setView={setView} />}
            </div>
        </div>
    );
}

// --- AUTH COMPONENTS ---
function LoginForm({ setToken, setView }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${AUTH_URL}/login`, { username, password });
            const jwt = typeof res.data === 'string' ? res.data : res.data.token;
            localStorage.setItem('token', jwt);
            setToken(jwt);
        } catch (err) { setMsg('Login failed.'); }
    };
    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Login</h2>
            <input className="w-full p-2 border rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input className="w-full p-2 border rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="w-full bg-blue-600 text-white py-2 rounded">Sign In</button>
            {msg && <p className="text-red-500 text-sm text-center">{msg}</p>}
            <p className="text-center text-sm"><button type="button" onClick={() => setView('register')} className="text-blue-600 underline">Register</button></p>
        </form>
    );
}

function RegisterForm({ setView }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [msg, setMsg] = useState('');
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${AUTH_URL}/register`, { username, password, role });
            setMsg('Success!');
            setTimeout(() => setView('login'), 1500);
        } catch (err) { setMsg('Failed.'); }
    };
    return (
        <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Register</h2>
            <input className="w-full p-2 border rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input className="w-full p-2 border rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded bg-white">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
            </select>
            <button className="w-full bg-green-600 text-white py-2 rounded">Create Account</button>
            {msg && <p className="text-green-600 text-sm text-center">{msg}</p>}
            <p className="text-center text-sm"><button type="button" onClick={() => setView('login')} className="text-blue-600 underline">Back to Login</button></p>
        </form>
    );
}

// --- DASHBOARD ---
function Dashboard(props) {
    const showBilling = props.role === 'ADMIN' || props.role === 'STUDENT';

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-900">UniSystem <span className="text-sm font-normal text-gray-500">({props.role}: {props.username})</span></h1>
                <button onClick={props.logout} className="text-red-500 border border-red-200 px-4 py-1 rounded hover:bg-red-50">Logout</button>
            </nav>

            <main className="container mx-auto p-6 max-w-6xl">
                <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg mb-8 w-fit">
                    {['students', 'grades', 'courses'].map(tab => (
                        <button key={tab} onClick={() => props.setActiveTab(tab)} className={`px-6 py-2 rounded-md capitalize ${props.activeTab === tab ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>{tab}</button>
                    ))}
                    {showBilling && <button onClick={() => props.setActiveTab('billing')} className={`px-6 py-2 rounded-md capitalize ${props.activeTab === 'billing' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>Billing</button>}
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    {props.activeTab === 'students' && <StudentPanel {...props} />}
                    {props.activeTab === 'grades' && <GradePanel {...props} />}
                    {props.activeTab === 'courses' && <CoursePanel {...props} />}
                    {props.activeTab === 'billing' && showBilling && <BillingPanel {...props} />}
                </div>
            </main>
        </div>
    );
}

// --- PANELS ---

function StudentPanel({ token, role, setActiveTab, setSelectedStudentId }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ADMIN is the only one who can ADD
    const canWrite = role === 'ADMIN';

    // Load Students (Everyone can see this list)
    useEffect(() => {
        axios.get('http://localhost:8080/api/students', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setStudents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading students:", err);
                setError("Failed to load student list. Check console.");
                setLoading(false);
            });
    }, []);

    const add = async (e) => {
        e.preventDefault();
        const data = { name: e.target.name.value, email: e.target.email.value };
        try {
            await axios.post('http://localhost:8080/api/students', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Student Added!");
            window.location.reload();
        } catch (e) {
            alert("Error adding student: " + e.message);
        }
    }

    const goToGrade = (studentName) => {
        setSelectedStudentId(studentName);
        setActiveTab('grades');
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Students Directory</h2>

            {/* 1. ADMIN SECTION: Add Form */}
            {canWrite ? (
                <form onSubmit={add} className="flex gap-2 mb-6 p-4 bg-blue-50 rounded border border-blue-100">
                    <input name="name" placeholder="Full Name" className="border p-2 rounded flex-1" required />
                    <input name="email" placeholder="Email" className="border p-2 rounded flex-1" required />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Add New Student</button>
                </form>
            ) : (
                // 2. NON-ADMIN VIEW
                <div className="mb-6 p-3 bg-gray-100 rounded text-sm text-gray-600">
                    👋 You are logged in as a <strong>{role}</strong>. You can view the list below.
                </div>
            )}

            {/* 3. LIST SECTION (Visible to ALL) */}
            {loading && <p>Loading directory...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <table className="w-full text-left border-collapse shadow-sm rounded overflow-hidden">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {students.map(s => (
                        <tr key={s._id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{s.name}</td>
                            <td className="p-3 text-gray-500">{s.email}</td>
                            <td className="p-3">
                                {role === 'TEACHER' && (
                                    <button onClick={() => goToGrade(s.name)} className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 border border-green-200">
                                        ➕ Add Grade
                                    </button>
                                )}
                                {role === 'STUDENT' && <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Student View</span>}
                                {role === 'ADMIN' && <button onClick={() => goToGrade(s.name)} className="text-blue-600 hover:underline text-sm">Manage</button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function GradePanel({ token, role, username, selectedStudentId, setSelectedStudentId }) {
    const [grades, setGrades] = useState([]);
    const canWrite = role === 'ADMIN' || role === 'TEACHER';

    useEffect(() => {
        // Get ALL grades, then filter in frontend (Simpler for this demo)
        axios.get(`${GATEWAY_URL}/api/grades/`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (role === 'STUDENT') {
                    // Filter: Student sees ONLY their own grades (matching their username)
                    setGrades(res.data.filter(g => g.student_id === username));
                } else {
                    // Teacher/Admin sees ALL
                    setGrades(res.data);
                }
            })
            .catch(console.error);
    }, [role, username]);

    const add = async (e) => {
        e.preventDefault();
        const data = {
            student_id: e.target.student_id.value,
            course_id: e.target.course_id.value,
            grade: parseFloat(e.target.grade.value),
            type: e.target.type.value,
            teacher_id: username // Track who added it
        };
        await axios.post(`${GATEWAY_URL}/api/grades/`, data, { headers: { Authorization: `Bearer ${token}` } });
        // Refresh list
        const res = await axios.get(`${GATEWAY_URL}/api/grades/`, { headers: { Authorization: `Bearer ${token}` } });
        setGrades(res.data);
        setSelectedStudentId(''); // Clear selection
        e.target.reset();
    }

    const deleteGrade = async (id) => {
        if (!window.confirm("Delete this grade?")) return;
        await axios.delete(`${GATEWAY_URL}/api/grades/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setGrades(grades.filter(g => g.id !== id));
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Grades</h2>
            {canWrite && (
                <form onSubmit={add} className="grid grid-cols-5 gap-2 mb-6 p-4 bg-green-50 rounded border border-green-100">
                    {/* Auto-fill Student ID if redirected */}
                    <input name="student_id" defaultValue={selectedStudentId} placeholder="Student Name/ID" className="border p-2 rounded col-span-2 font-bold" required />
                    <input name="course_id" placeholder="Course" className="border p-2 rounded" required />
                    <input name="grade" type="number" step="0.1" placeholder="Grade" className="border p-2 rounded" required />
                    <input name="type" placeholder="Type" className="border p-2 rounded" required />
                    <button className="bg-green-600 text-white px-4 py-2 rounded col-span-5 mt-2">Submit Grade</button>
                </form>
            )}

            <div className="grid grid-cols-1 gap-3">
                {grades.length === 0 && <p className="text-gray-500">No grades found.</p>}
                {grades.map(g => (
                    <div key={g.id} className="flex justify-between items-center p-4 bg-white border rounded shadow-sm">
                        <div>
                            <p className="font-bold text-lg">{g.student_id}</p>
                            <p className="text-sm text-gray-600">{g.course_id} - <span className="font-medium">{g.type}</span></p>
                            <p className="text-xs text-gray-400">Added by: {g.teacher_id}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-blue-600">{g.grade}</span>
                            {canWrite && <button onClick={() => deleteGrade(g.id)} className="text-red-500 hover:text-red-700 text-sm">🗑️</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- HELPER: Parse SOAP XML to JavaScript Array ---
function parseCoursesFromXml(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    // JAX-WS usually returns a list of <return> elements
    const items = xmlDoc.getElementsByTagName("return");
    const courses = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Helper to safely get text from child tags (e.g., <id>, <name>)
        const getText = (tag) => item.getElementsByTagName(tag)[0]?.textContent || "";

        courses.push({
            id: getText("id"),
            name: getText("name"),
            description: getText("description"),
            credits: getText("credits")
        });
    }
    return courses;
}

// --- UPDATED COURSE PANEL ---
function CoursePanel({ token, role }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    const canWrite = role === 'ADMIN' || role === 'TEACHER';

    // 1. FETCH COURSES (SOAP Request)
    const fetchCourses = async () => {
        // The SOAP Envelope to ask for "getAllCourses"
        const xml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cour="http://course.university.com/">
         <soapenv:Header/>
         <soapenv:Body>
            <cour:getAllCourses/>
         </soapenv:Body>
      </soapenv:Envelope>`;

        try {
            const res = await axios.post(`${GATEWAY_URL}/api/courses/ws/courses`, xml, {
                headers: { 'Content-Type': 'text/xml' }
            });
            // Convert XML response to JS Array
            const parsedCourses = parseCoursesFromXml(res.data);
            setCourses(parsedCourses);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setMsg("Failed to load courses.");
            setLoading(false);
        }
    };

    // Load on startup
    useEffect(() => { fetchCourses(); }, []);

    // 2. ADD COURSE (SOAP Request)
    const add = async (e) => {
        e.preventDefault();
        const xml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cour="http://course.university.com/">
         <soapenv:Header/>
         <soapenv:Body>
            <cour:addCourse>
               <arg0>${e.target.id.value}</arg0>
               <arg1>${e.target.name.value}</arg1>
               <arg2>${e.target.desc.value}</arg2>
               <arg3>${e.target.credits.value}</arg3>
            </cour:addCourse>
         </soapenv:Body>
      </soapenv:Envelope>`;
        try {
            await axios.post(`${GATEWAY_URL}/api/courses/ws/courses`, xml, { headers: { 'Content-Type': 'text/xml' } });
            setMsg('Course Added Successfully!');
            e.target.reset();
            fetchCourses(); // Refresh list immediately
        } catch (e) { setMsg('Error adding course.'); }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Course Catalog</h2>

            {/* Add Form (Teachers/Admin Only) */}
            {canWrite && (
                <form onSubmit={add} className="grid grid-cols-5 gap-2 mb-8 p-4 bg-purple-50 rounded border border-purple-100">
                    <input name="id" placeholder="ID (CS101)" className="border p-2 rounded" required />
                    <input name="name" placeholder="Title" className="border p-2 rounded col-span-2" required />
                    <input name="desc" placeholder="Desc" className="border p-2 rounded" required />
                    <input name="credits" type="number" placeholder="Cr" className="border p-2 rounded w-16" required />
                    <button className="bg-purple-600 text-white px-4 py-2 rounded col-span-5 mt-2">Add Course</button>
                    {msg && <p className="col-span-5 text-sm text-green-600 text-center mt-1">{msg}</p>}
                </form>
            )}

            {/* List Display (Visible to Everyone) */}
            {loading && <p>Loading catalog...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.length === 0 && !loading && <p className="text-gray-500">Catalog is empty.</p>}

                {courses.map((c, idx) => (
                    <div key={idx} className="bg-white p-4 border rounded shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-blue-800">{c.name}</h3>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">{c.id}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-2">{c.description}</p>
                        <p className="text-right text-xs font-bold text-purple-600 mt-3">{c.credits} Credits</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
function BillingPanel({ token, role, username }) {
    // MOCK BILLING SYSTEM (Since backend SOAP is stateless)
    // We use LocalStorage to simulate "Pending Bills" for the demo
    const [bills, setBills] = useState([]);
    const isAdmin = role === 'ADMIN';

    // Load bills on mount
    useEffect(() => {
        const savedBills = JSON.parse(localStorage.getItem('university_bills') || '[]');
        if (isAdmin) {
            setBills(savedBills);
        } else {
            // Student sees only THEIR bills
            setBills(savedBills.filter(b => b.studentId === username));
        }
    }, [role, username]);

    const addBill = async (e) => {
        e.preventDefault();
        const newBill = {
            id: Date.now(),
            studentId: e.target.studentId.value,
            amount: e.target.amount.value,
            date: new Date().toLocaleDateString()
        };

        // Save locally
        const updated = [...bills, newBill];
        localStorage.setItem('university_bills', JSON.stringify(updated));
        setBills(updated);
        e.target.reset();
    }

    const payBill = async (bill) => {
        // 1. Call Real Backend (SOAP) to process payment
        const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body><tem:ProcessPayment><tem:studentId>${bill.studentId}</tem:studentId><tem:amount>${bill.amount}</tem:amount><tem:currency>USD</tem:currency></tem:ProcessPayment></soapenv:Body></soapenv:Envelope>`;
        try {
            await axios.post(`${GATEWAY_URL}/api/billing/billing.asmx`, xml, { headers: { 'Content-Type': 'text/xml', 'SOAPAction': 'http://tempuri.org/IBillingService/ProcessPayment' } });

            // 2. Remove from list (It's gone!)
            const updated = bills.filter(b => b.id !== bill.id);
            setBills(updated);
            localStorage.setItem('university_bills', JSON.stringify(updated)); // Update Storage
            alert("Payment Successful! Bill cleared.");
        } catch (e) { alert("Payment Failed"); }
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Billing & Payments</h2>

            {isAdmin && (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded">
                    <h3 className="font-bold mb-2 text-orange-800">Create New Bill</h3>
                    <form onSubmit={addBill} className="flex gap-2">
                        <input name="studentId" placeholder="Student Username (e.g. hamdi)" className="border p-2 rounded flex-1" required />
                        <input name="amount" type="number" placeholder="Amount ($)" className="border p-2 rounded w-32" required />
                        <button className="bg-orange-600 text-white px-4 py-2 rounded">Send Bill</button>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {bills.length === 0 && <p className="text-gray-500 italic">No pending bills.</p>}
                {bills.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-4 bg-white border rounded shadow-sm hover:shadow-md transition">
                        <div>
                            <p className="font-bold text-lg">Student: {b.studentId}</p>
                            <p className="text-sm text-gray-500">Date: {b.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-red-600">${b.amount}</span>
                            {/* Only Student can PAY. Admin can just view/delete */}
                            {!isAdmin && (
                                <button onClick={() => payBill(b)} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
                                    PAY NOW
                                </button>
                            )}
                            {isAdmin && <span className="text-gray-400 text-sm">Pending</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;