import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span className="text-white text-xl font-bold">AI Tutor</span>
            </Link>
          </div>
          
          {/* Added navigation links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-white hover:text-gray-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Chat
            </Link>
            <Link
              href="/voiceagent"
              className="text-white hover:text-gray-200 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Voice Agent
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}