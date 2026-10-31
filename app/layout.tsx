import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VIT Chennai - On-Duty (OD) Management System",
  description:
    "Institutional full-stack On-Duty (OD) portal connecting Students, Clubs, Faculty Coordinators, and the Student Welfare Centre (SWC).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">
                Vellore Institute of Technology, Chennai
              </span>
              <span>•</span>
              <span>Student Welfare Centre (SWC)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Vandalur-Kelambakkam Road, Chennai, Tamil Nadu 600127 • Academic Portal 2026–2027
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

