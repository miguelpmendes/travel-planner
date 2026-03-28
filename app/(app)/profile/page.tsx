import { auth } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile/profile-editor";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">O meu perfil</h1>
        <p className="text-gray-500 mt-1">Personaliza o teu ícone</p>
      </div>
      <ProfileEditor
        currentEmoji={session?.user.avatarEmoji ?? null}
        userName={session?.user.name ?? ""}
        username={session?.user.username ?? ""}
      />
    </div>
  );
}
