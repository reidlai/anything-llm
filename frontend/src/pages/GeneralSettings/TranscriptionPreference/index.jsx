import React, { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/SettingsSidebar";
import System from "@/models/system";
import showToast from "@/utils/toast";
import PreLoader from "@/components/Preloader";

import OpenAiLogo from "@/assets/llmprovider/openai.png";
import AnythingLLMIcon from "@/assets/logo/anything-llm-icon.png";
import OpenAiWhisperOptions from "@/components/TranscriptionSelection/OpenAiOptions";
import NativeTranscriptionOptions from "@/components/TranscriptionSelection/NativeTranscriptionOptions";
import LLMItem from "@/components/LLMSelection/LLMItem";
import { CaretUpDown, MagnifyingGlass, X } from "@phosphor-icons/react";

export default function TranscriptionModelPreference() {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = { WhisperProvider: selectedProvider };
    const formData = new FormData(form);

    for (var [key, value] of formData.entries()) data[key] = value;
    const { error } = await System.updateSystem(data);
    setSaving(true);

    if (error) {
      showToast(`Failed to save preferences: ${error}`, "error");
    } else {
      showToast("Transcription preferences saved successfully.", "success");
    }
    setSaving(false);
    setHasChanges(!!error);
  };

  const updateProviderChoice = (selection) => {
    setSearchQuery("");
    setSelectedProvider(selection);
    setSearchMenuOpen(false);
    setHasChanges(true);
  };

  const handleXButton = () => {
    if (searchQuery.length > 0) {
      setSearchQuery("");
      if (searchInputRef.current) searchInputRef.current.value = "";
    } else {
      setSearchMenuOpen(!searchMenuOpen);
    }
  };

  useEffect(() => {
    async function fetchKeys() {
      const _settings = await System.keys();
      setSettings(_settings);
      setSelectedProvider(_settings?.WhisperProvider || "local");
      setLoading(false);
    }
    fetchKeys();
  }, []);

  const PROVIDERS = [
    {
      name: "OpenAI",
      value: "openai",
      logo: OpenAiLogo,
      options: <OpenAiWhisperOptions settings={settings} />,
      description:
        "Leverage the OpenAI Whisper-large model using your API key.",
    },
    {
      name: "AnythingLLM Built-In",
      value: "local",
      logo: AnythingLLMIcon,
      options: <NativeTranscriptionOptions settings={settings} />,
      description: "Run a built-in whisper model on this instance privately.",
    },
  ];

  useEffect(() => {
    const filtered = PROVIDERS.filter((provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [searchQuery, selectedProvider]);

  const selectedProviderObject = PROVIDERS.find(
    (provider) => provider.value === selectedProvider
  );

  return (
    <div
      style={{ height: "calc(100vh - 40px)" }}
      className="w-screen overflow-hidden bg-sidebar flex"
    >
      <Sidebar />
      {loading ? (
        <div className="transition-all duration-500 relative ml-[2px] mr-[16px] my-[16px] md:rounded-[16px] bg-main-gradient w-full h-[93vh] overflow-y-scroll border-2 border-outline">
          <div className="w-full h-full flex justify-center items-center">
            <PreLoader />
          </div>
        </div>
      ) : (
        <div className="transition-all duration-500 relative ml-[2px] mr-[16px] my-[16px] md:rounded-[16px] bg-main-gradient w-full h-[93vh] overflow-y-scroll border-2 border-outline">
          <form onSubmit={handleSubmit} className="flex w-full">
            <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[86px] md:py-6 py-16">
              <div className="w-full flex flex-col gap-y-1 pb-6 border-white border-b-2 border-opacity-10">
                <div className="flex gap-x-4 items-center">
                  <p className="text-lg leading-6 font-bold text-white">
                    Transcription Model Preference
                  </p>
                  {hasChanges && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-[#2C2F36] text-white text-sm hover:bg-[#3D4147] shadow-md border border-[#3D4147]"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  )}
                </div>
                <p className="text-xs leading-[18px] font-base text-white text-opacity-60">
                  These are the credentials and settings for your preferred
                  transcription model provider. Its important these keys are
                  current and correct or else media files and audio will not
                  transcribe.
                </p>
              </div>
              <div className="text-base font-bold text-white mt-6 mb-4">
                Transcription Provider
              </div>
              <div className="relative">
                {searchMenuOpen && (
                  <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 backdrop-blur-sm z-10"
                    onClick={() => setSearchMenuOpen(false)}
                  />
                )}
                {searchMenuOpen ? (
                  <div className="absolute top-0 left-0 w-full max-w-[640px] max-h-[310px] overflow-auto white-scrollbar min-h-[64px] bg-[#18181B] rounded-lg flex flex-col justify-between cursor-pointer border-2 border-[#46C8FF] z-20">
                    <div className="w-full flex flex-col gap-y-1">
                      <div className="flex items-center sticky top-0 border-b border-[#9CA3AF] mx-4 bg-[#18181B]">
                        <MagnifyingGlass
                          size={20}
                          weight="bold"
                          className="absolute left-4 z-30 text-white -ml-4 my-2"
                        />
                        <input
                          type="text"
                          name="provider-search"
                          autoComplete="off"
                          placeholder="Search audio transcription providers"
                          className="-ml-4 my-2 bg-transparent z-20 pl-12 h-[38px] w-full px-4 py-1 text-sm outline-none focus:border-white text-white placeholder:text-white placeholder:font-medium"
                          onChange={(e) => setSearchQuery(e.target.value)}
                          ref={searchInputRef}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                        />
                        <X
                          size={20}
                          weight="bold"
                          className="cursor-pointer text-white hover:text-[#9CA3AF]"
                          onClick={handleXButton}
                        />
                      </div>
                      <div className="flex-1 pl-4 pr-2 flex flex-col gap-y-1 overflow-y-auto white-scrollbar pb-4">
                        {filteredProviders.map((provider) => (
                          <LLMItem
                            key={provider.name}
                            name={provider.name}
                            value={provider.value}
                            image={provider.logo}
                            description={provider.description}
                            checked={selectedProvider === provider.value}
                            onClick={() => updateProviderChoice(provider.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full max-w-[640px] h-[64px] bg-[#18181B] rounded-lg flex items-center p-[14px] justify-between cursor-pointer border-2 border-transparent hover:border-[#46C8FF] transition-all duration-300"
                    type="button"
                    onClick={() => setSearchMenuOpen(true)}
                  >
                    <div className="flex gap-x-4 items-center">
                      <img
                        src={selectedProviderObject.logo}
                        alt={`${selectedProviderObject.name} logo`}
                        className="w-10 h-10 rounded-md"
                      />
                      <div className="flex flex-col text-left">
                        <div className="text-sm font-semibold text-white">
                          {selectedProviderObject.name}
                        </div>
                        <div className="mt-1 text-xs text-[#D2D5DB]">
                          {selectedProviderObject.description}
                        </div>
                      </div>
                    </div>
                    <CaretUpDown
                      size={24}
                      weight="bold"
                      className="text-white"
                    />
                  </button>
                )}
              </div>
              <div
                onChange={() => setHasChanges(true)}
                className="mt-4 flex flex-col gap-y-1"
              >
                {selectedProvider &&
                  PROVIDERS.find(
                    (provider) => provider.value === selectedProvider
                  )?.options}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
