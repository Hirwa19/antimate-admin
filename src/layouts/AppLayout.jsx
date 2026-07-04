import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main section */}
      <div className="flex flex-col flex-1 min-w-0">

        <Navbar />

        <main className="flex-1 w-full p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}