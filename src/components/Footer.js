export default function Footer() {
    return (
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} AI Assistant. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="/privacy"
                className="text-sm hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sm hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="mailto:support@aiassistant.com"
                className="text-sm hover:text-white transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }