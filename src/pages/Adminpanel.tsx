import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { signupSchema } from '../features/auth/validation/schemas';

interface Profile {
  id: string;
  email: string;
  role?: string;
  waiting_list?: boolean;
}

interface AuthFormData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
}

export const Adminpanel = () => {
  const user = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Get1newpr@duct');
  const [companyName, setCompanyName] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user?.user?.id) return setIsAdmin(false);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

      if (error) {
        console.error('Error verifying admin:', error);
        return setIsAdmin(false);
      }

      setIsAdmin(data?.role === 'admin');
    };

    verifyAdmin();
  }, [user?.user?.id]);

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) return console.error('Error fetching users:', error);
      if (data) {
        setUsers(data as unknown as Profile[]);
      }
    };

    loadUsers();
  }, []);

  const signUp = async (data: AuthFormData) => {
    const response = await fetch(
      'https://testpilot.app.n8n.cloud/webhook/70de7235-766e-4097-b388-7829d4dff16e',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          companyName: data.companyName,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const result = await response.json();
    return result;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const validatedData = signupSchema.parse({
        email,
        password,
        fullName: email.split('@')[0],
        companyName,
      });

      const newUser = await signUp(validatedData);

      if (newUser) {
        console.log('New user created:', newUser);
      }

      console.log('User and company created successfully');
      setEmail('');
      setPassword('');
      setCompanyName('');
      setShowForm(false);

      const { data } = await supabase.from('profiles').select('*');
      if (data) {
        setUsers(data as Profile[]);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error?.message) {
        setErrorMessage(error.message);
      } else if (error?.error_description) {
        setErrorMessage(error.error_description);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const handleWaitingList = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ waiting_list: true })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, waiting_list: true } : u)));
    } catch (error) {
      console.error('Error updating waiting list:', error);
    }
  };

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        {showForm ? 'Hide Form' : 'Add User'}
      </button>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Create User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  autoComplete="off"
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Leave blank to use default password"
                  className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  autoComplete="off"
                  onChange={e => setCompanyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:shadow-outline"
                />
              </div>

              {errorMessage && <div className="mb-4 text-red-500 text-sm">{errorMessage}</div>}

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-2">User List</h2>
      <div className="space-y-2">
        {users.map(user => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded shadow-sm"
          >
            <span>{user.email}</span>
            {/* <button
                            onClick={() => handleWaitingList(user.id)}
                            disabled={user.waiting_list}
                            className={`px-3 py-1 rounded-full text-white ${user.waiting_list
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {user.waiting_list ? 'In Waiting List' : 'Add to Waiting List'}
                        </button> */}
          </div>
        ))}
      </div>
    </div>
  );
};
