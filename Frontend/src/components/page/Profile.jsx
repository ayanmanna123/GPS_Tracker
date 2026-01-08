import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import Navbar from "../shared/Navbar";
import { User, Mail } from "lucide-react";

const Profile = () => {
  const { usere, darktheme } = useSelector((store) => store.auth);
  const { t } = useTranslation();

  if (!usere) {
    return (
      <div
        className={`min-h-screen ${darktheme
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-green-50 via-white to-green-100"
          }`}
      >
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <p
            className={`text-center text-lg ${darktheme ? "text-gray-400" : "text-gray-600"
              }`}
          >
            {t("profile.noUserData")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darktheme
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-green-100"
        }`}
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}

        <div className="max-w-2xl mx-auto">
          <Card
            className={`shadow-xl rounded-2xl border ${darktheme
                ? "bg-gray-800/80 border-gray-700 backdrop-blur-sm"
                : "bg-white/80 border-green-100 backdrop-blur-sm"
              }`}
          >
            {/* Profile Header */}
            <CardHeader className="flex flex-col items-center space-y-4 pb-6">
              <div className="relative">
                <Avatar
                  className={`w-32 h-32 border-4 shadow-lg ${darktheme ? "border-green-700" : "border-green-200"
                    }`}
                >
                  {usere.picture ? (
                    <AvatarImage
                      src={usere.picture}
                      alt={usere.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback
                      className={`text-3xl font-bold ${darktheme
                          ? "bg-green-900 text-green-400"
                          : "bg-green-100 text-green-700"
                        }`}
                    >
                      {usere.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 ${darktheme ? "border-gray-800" : "border-white"
                    }`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle
                  className={`text-2xl font-bold mb-1 ${darktheme ? "text-white" : "text-gray-800"
                    }`}
                >
                  {usere.name}
                </CardTitle>
                <div
                  className={`flex items-center justify-center ${darktheme ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{usere.email}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Additional Info Cards */}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm">
          <p className={darktheme ? "text-gray-500" : "text-gray-500"}>
            {t("profile.copyright")}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Profile;