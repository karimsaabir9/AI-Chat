"use client";

import { signOut, useSession } from "@/lib/auth-client";

const DashboardClient = () => {
  const { data: session, isPending } = useSession();
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (!session) {
    return <div>Not loged in</div>;
  }
  return (
    <div>
      Page {session?.user.email} {isPending ? "Loading..." : "Loaded"}


      <button onClick={() => signOut()}>sign Out</button>
    </div>
  );
};

export default DashboardClient;
