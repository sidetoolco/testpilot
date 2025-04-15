import { useAuth } from "../features/auth/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';

type User = {
    id: string;
    email: string;
};

export const Adminpanel = () => {
    const user = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Fetch users from the database
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users'); // Adjust the endpoint as needed
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Logic to create user goes here
        console.log('Creating user with email:', email, 'and password:', password);
    };

    // if (user?.user?.role !== 'admin') {
    //     return <Navigate to="/" />
    // }
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Adminpanel</h1>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
            >
                {showForm ? 'Hide Form' : 'Add User'}
            </button>
            {showForm && (
                <form onSubmit={handleCreateUser} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Create User
                    </button>
                </form>
            )}
            <h2 className="text-xl font-bold mb-2">User List</h2>
            <ul className="list-disc pl-5">
                {users.map((user) => (
                    <li key={user.id} className="mb-1">{user.email}</li>
                ))}
            </ul>
        </div>
    )
}   