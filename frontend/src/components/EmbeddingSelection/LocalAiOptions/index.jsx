import React, { useEffect, useState } from "react";
import System from "@/models/system";
import InputField from "@/components/lib/InputField";

export default function LocalAiOptions({ settings }) {
  const [basePathValue, setBasePathValue] = useState(
    settings?.EmbeddingBasePath
  );
  const [basePath, setBasePath] = useState(settings?.EmbeddingBasePath);
  const [apiKeyValue, setApiKeyValue] = useState(settings?.LocalAiApiKey);
  const [apiKey, setApiKey] = useState(settings?.LocalAiApiKey);

  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="w-full flex items-center gap-4">
        <InputField
          type="url"
          label="LocalAI Base URL"
          name="EmbeddingBasePath"
          placeholder="http://localhost:8080/v1"
          defaultValue={settings?.EmbeddingBasePath}
          onChange={(e) => setBasePathValue(e.target.value)}
          onBlur={() => setBasePath(basePathValue)}
          required={true}
          autoComplete="off"
          spellCheck={false}
          className="w-60"
        />
        <LocalAIModelSelection
          settings={settings}
          apiKey={apiKey}
          basePath={basePath}
        />
        <InputField
          type="number"
          label="Max embedding chunk length"
          name="EmbeddingModelMaxChunkLength"
          placeholder="1000"
          min={1}
          onScroll={(e) => e.target.blur()}
          defaultValue={settings?.EmbeddingModelMaxChunkLength}
          required={false}
          autoComplete="off"
          className="w-60"
        />
      </div>
      <div className="w-full flex items-center gap-4">
        <div className="flex flex-col w-60">
          <div className="flex flex-col gap-y-1 mb-4">
            <label className="text-white text-sm font-semibold flex items-center gap-x-2">
              Local AI API Key{" "}
              <p className="!text-xs !italic !font-thin">optional</p>
            </label>
          </div>
          <InputField
            type="password"
            name="LocalAiApiKey"
            placeholder="sk-mysecretkey"
            defaultValue={settings?.LocalAiApiKey ? "*".repeat(20) : ""}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setApiKeyValue(e.target.value)}
            onBlur={() => setApiKey(apiKeyValue)}
            className="w-60"
          />
        </div>
      </div>
    </div>
  );
}

function LocalAIModelSelection({ settings, apiKey = null, basePath = null }) {
  const [customModels, setCustomModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function findCustomModels() {
      if (!basePath || !basePath.includes("/v1")) {
        setCustomModels([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { models } = await System.customModels(
        "localai",
        typeof apiKey === "boolean" ? null : apiKey,
        basePath
      );
      setCustomModels(models || []);
      setLoading(false);
    }
    findCustomModels();
  }, [basePath, apiKey]);

  if (loading || customModels.length == 0) {
    return (
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-4">
          Embedding Model Name
        </label>
        <select
          name="EmbeddingModelPref"
          disabled={true}
          className="bg-zinc-900 border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled={true} selected={true}>
            {basePath?.includes("/v1")
              ? "-- loading available models --"
              : "-- waiting for URL --"}
          </option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60">
      <label className="text-white text-sm font-semibold block mb-4">
        Embedding Model Name
      </label>
      <select
        name="EmbeddingModelPref"
        required={true}
        className="bg-zinc-900 border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        {customModels.length > 0 && (
          <optgroup label="Your loaded models">
            {customModels.map((model) => {
              return (
                <option
                  key={model.id}
                  value={model.id}
                  selected={settings?.EmbeddingModelPref === model.id}
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
