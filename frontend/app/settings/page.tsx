"use client";
import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

interface ModelChoice {
  value: string;
  label: string;
}

const SettingsForm: React.FC = () => {
  const [model, setModel] = useState<string>("");
  const [maxTokens, setMaxTokens] = useState<number>(200);
  const [customizeResponse, setCustomizeResponse] = useState<string>("");
  const [modelChoices, setModelChoices] = useState<ModelChoice[]>([]);
  const router = useRouter();

  const API_URL = "http://127.0.0.1:8000/api/settings/update/";
  const MODEL_CHOICES_URL = "http://127.0.0.1:8000/api/settings/model-choices/";

  useEffect(() => {
    const fetchSettings = async () => {
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        console.error("No access token found");
        return;
      }

      try {
        const [settingsResponse, modelChoicesResponse] = await Promise.all([
          axios.get(API_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(MODEL_CHOICES_URL),
        ]);

        setModel(settingsResponse.data.model);
        setMaxTokens(settingsResponse.data.max_tokens);
        setCustomizeResponse(settingsResponse.data.customize_response);
        setModelChoices(modelChoicesResponse.data);
      } catch (error: any) {
        console.error(
          "Error fetching data:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const accessToken = Cookies.get("access_token");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      await axios.put(
        API_URL,
        { model, max_tokens: maxTokens, customize_response: customizeResponse },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Settings updated successfully!");
    } catch (error: any) {
      console.error(
        "Error updating settings:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <Toaster /> {/* Toast container */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Update Settings
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-rose-500"
          >
            {modelChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Max Tokens
          </label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Customize Response
          </label>
          <textarea
            value={customizeResponse}
            onChange={(e) => setCustomizeResponse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-rose-500 resize-none h-28"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-rose-700 text-white font-semibold py-2 rounded-md transition duration-200"
        >
          Update Settings
        </button>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-rose-600 hover:underline items-center text-center"
          >
            Go Back Home
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
