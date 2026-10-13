import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CategorieDataPage() {
  const session = await getServerSession(authOptions);
        if (!session) {
            redirect('/login');
        }
  return <h1>Gestion des catégories</h1>;
}
