import './globals.css'

export const metadata = {
  title: 'Adventure Coach',
  description: 'Goal-countdown fitness coaching. Will you be ready in time?',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
