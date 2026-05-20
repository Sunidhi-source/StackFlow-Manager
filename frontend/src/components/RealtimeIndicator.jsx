import { useSocket } from '../context/SocketContext';

const RealtimeIndicator = () => {
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
        }`}
      />
      <span className={isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};

export default RealtimeIndicator;
