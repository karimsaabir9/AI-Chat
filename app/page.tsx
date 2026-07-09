import { getUser } from "@/server/user";
import { redirect } from "next/navigation";

const Home = async () => {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/signin");
};

export default Home;
