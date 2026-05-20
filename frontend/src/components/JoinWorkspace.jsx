import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export default function JoinWorkspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [status, setStatus] = useState('Joining workspace...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('Invalid invite link.');
      return;
    }

    if (!user) {
      toast.error('Please log in first to accept the invite.');
      navigate(`/auth`);
      return;
    }

    const join = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/workspaces/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Joined workspace successfully!');
          navigate('/');
        } else {
          setStatus(data.message || 'Failed to join workspace.');
          toast.error(data.message || 'Failed to join');
        }
      } catch {
        setStatus('Server error. Please try again.');
      }
    };

    join();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="text-center p-10">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">{status}</p>
      </div>
    </div>
  );
}
