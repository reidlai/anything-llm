import System from "@/models/system";
import { useState, useEffect } from "react";
import InputField from "@/components/lib/InputField";

export default function PerplexityOptions({ settings }) {
  return (
    <div className="flex gap-x-4">
      <InputField
        type="password"
        name="PerplexityApiKey"
        placeholder="Perplexity API Key"
        defaultValue={settings?.PerplexityApiKey ? "*".repeat(20) : ""}
        required={true}
        autoComplete="off"
        spellCheck={false}
        label="Perplexity API Key"
        inputClassName="w-full"
        className="w-60"
      />
      {!settings?.credentialsOnly && (
        <PerplexityModelSelection settings={settings} />
      )}
    </div>
  );
}

function PerplexityModelSelection({ settings }) {
  const [customModels, setCustomModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function findCustomModels() {
      setLoading(true);
      const { models } = await System.customModels("perplexity");
      setCustomModels(models || []);
      setLoading(false);
    }
    findCustomModels();
  }, []);

  if (loading || customModels.length == 0) {
    return (
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-4">
          Chat Model Selection
        </label>
        <select
          name="PerplexityModelPref"
          disabled={true}
          className="bg-zinc-900 border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled={true} selected={true}>
            -- loading available models --
          </option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60">
      <label className="text-white text-sm font-semibold block mb-4">
        Chat Model Selection
      </label>
      <select
        name="PerplexityModelPref"
        required={true}
        className="bg-zinc-900 border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        {customModels.length > 0 && (
          <optgroup label="Available Perplexity Models">
            {customModels.map((model) => {
              return (
                <option
                  key={model.id}
                  value={model.id}
                  selected={settings?.PerplexityModelPref === model.id}
                >
                  {model.id}
                </option>
              );
            })}
          </optgroup>
        )}
      </select>
    </div>
  );
}
