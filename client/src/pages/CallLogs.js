import { useState, useEffect } from 'react';
import { getCallLogs, clearCallLogs } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, PhoneOff, Video, Trash2 } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function CallLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await getCallLogs();
      setLogs(res.data);
    } catch (err) {
      toast.error('Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all call logs?')) return;
    try {
      await clearCallLogs();
      setLogs([]);
      toast.success('Call logs cleared');
    } catch (err) {
      toast.error('Failed to clear call logs');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '' : d.toLocaleString();
  };

  if (loading) {
    return <div className="text-center p-8">Loading logs...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Call Logs</h1>
        {logs.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 transition"
          >
            <Trash2 size={20} />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <Phone className="mx-auto mb-4 text-gray-400" size={48} />
          <p>No call logs found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {logs.map((log) => {
              // Determine if current user is caller or callee
              // Defensively check _id if available, log.caller might be populated obj
              const isCaller = log.caller && (log.caller._id === user._id || log.caller === user._id);
              const otherUser = isCaller ? log.callee : log.caller;
              
              if (!otherUser) return null; // Safe guard for deleted users

              return (
                <li key={log._id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={otherUser.avatar} 
                      name={otherUser.name} 
                      className="w-12 h-12" 
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{otherUser.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {log.status === 'missed' ? (
                          <span className="text-red-500 flex items-center gap-1">
                            <PhoneMissed size={14} /> Missed
                          </span>
                        ) : log.status === 'rejected' ? (
                          <span className="text-gray-500 flex items-center gap-1">
                            <PhoneOff size={14} /> Rejected
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            {isCaller ? <PhoneOutgoing size={14} /> : <PhoneIncoming size={14} />} 
                            {isCaller ? 'Outgoing' : 'Incoming'} 
                            {log.callType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                          </span>
                        )}
                        <span>•</span>
                        <span>{formatDate(log.startTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.status === 'completed' && log.duration > 0 ? (
                      <p className="font-medium text-gray-700">{formatDuration(log.duration)}</p>
                    ) : (
                      <p className="font-medium text-gray-400">0s</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
