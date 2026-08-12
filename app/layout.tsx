import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ToastProvider } from "@/context/ToastContext"
import { Toast } from "@/components/ui/Toast"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Lokka — Gestion locative",
  description: "Gérez vos immeubles, locataires et loyers en toute simplicité.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <ToastProvider>
            {children}
            <Toast />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
