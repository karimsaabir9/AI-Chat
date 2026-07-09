import { getUser } from "@/server/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logout from "@/components/Logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquarePlus, Sparkles, ImageIcon } from "lucide-react";

const Dashboard = async () => {
  const user = await getUser();

  if (!user) {
    redirect("/signin");
  }

  const name = user.user.name || user.user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="border-b border-rose-100 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">AI Chat</span>
          </div>
          <Logout />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome card */}
        <div className="rounded-2xl border border-rose-100 bg-white shadow-sm p-8 flex items-center gap-6">
          <Avatar size="lg" className="h-16 w-16">
            <AvatarImage src={user.user.image || ""} />
            <AvatarFallback className="bg-rose-500 text-white text-xl font-medium">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{user.user.email}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <Link
            href="/chat"
            className="group rounded-2xl border border-rose-100 bg-white shadow-sm p-6 flex items-start gap-4 hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="h-11 w-11 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500 transition-colors">
              <MessageSquarePlus className="h-5 w-5 text-rose-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Start a new chat</h2>
              <p className="text-sm text-gray-500 mt-1">
                Ask questions and get help from the AI assistant.
              </p>
            </div>
          </Link>

          <Link
            href="/chat"
            className="group rounded-2xl border border-rose-100 bg-white shadow-sm p-6 flex items-start gap-4 hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="h-11 w-11 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500 transition-colors">
              <ImageIcon className="h-5 w-5 text-rose-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Generate an image</h2>
              <p className="text-sm text-gray-500 mt-1">
                Switch to image mode in any chat to create AI images.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
