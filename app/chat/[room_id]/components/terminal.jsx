export function Terminal({ children }) {
  return (
    <div className="w-full bg-black border border-green-500 rounded-md overflow-hidden shadow-lg shadow-green-900/20">
      <div className="bg-gray-900 px-4 py-2 border-b border-green-500 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-xs text-green-400 font-mono">
          secure-ai-terminal -- 80x24
        </div>
      </div>
      <div className="h-[60vh] overflow-y-auto p-4 font-mono text-sm bg-black">
        {children}
      </div>
    </div>
  );
}
