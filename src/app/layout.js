import "./globals.css";


export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-[90vh] bg-black">
        {children}
        </main>
      </body>
    </html>
  );
}
