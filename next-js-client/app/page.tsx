"use client";

import { useState } from "react";

const testDocument = "http://localhost:8080/test.pdf";

const apiEndpoints = [
  {
    name: "Get Metadata",
    endpoint: "/document/get-metadata",
    method: "GET",
    defaultBody: {},
  },
  {
    name: "Count Pages",
    endpoint: "/document/count-pages",
    method: "GET",
    defaultBody: {},
  },
  {
    name: "Get Markdown",
    endpoint: "/document/to-markdown",
    method: "GET",
    defaultBody: {},
  },
];

export default function Home() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(apiEndpoints[0].defaultBody, null, 2)
  );
  const [response, setResponse] = useState("");

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const endpoint = apiEndpoints.find((ep) => ep.name === selectedName);
    if (endpoint) {
      setSelectedEndpoint(endpoint);
      setRequestBody(JSON.stringify(endpoint.defaultBody, null, 2));
    }
  };

  const handleExecute = async () => {
    setResponse("fetching ...");
    let url = `http://localhost:8080${selectedEndpoint.endpoint}`;
    const method = selectedEndpoint.method;
    const body = method === "GET" ? undefined : JSON.parse(requestBody);
    const requestOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET") {
      requestOptions.body = JSON.stringify({
        url: testDocument,
        ...body,
      });
    } else {
      const queryParams = new URLSearchParams({
        url: testDocument,
        ...body,
      }).toString();
      url += `?${queryParams}`;
    }

    try {
      const res = await fetch(url, requestOptions);

      if (res.ok) {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        setResponse(`Error: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto bg-gray-800 text-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">REST API Console</h1>
        <div className="mb-4">
          <label htmlFor="endpoint" className="block mb-2">
            Select Endpoint:
          </label>
          <select
            id="endpoint"
            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEndpoint.name}
            onChange={handleEndpointChange}
          >
            {apiEndpoints.map((endpoint) => (
              <option key={endpoint.name} value={endpoint.name}>
                {endpoint.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="requestBody" className="block mb-2">
            Request Body (JSON):
          </label>
          <textarea
            id="requestBody"
            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
          ></textarea>
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={handleExecute}
        >
          Execute
        </button>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Request:</h2>
          <pre className="bg-gray-700 rounded-md p-4 overflow-auto">
            {selectedEndpoint.method} {selectedEndpoint.endpoint}
            <br />
            <br />
            PDF URL: {testDocument}
            {requestBody && (
              <>
                <br />
                <br />
                {requestBody}
              </>
            )}
          </pre>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Response:</h2>
          <pre className="bg-gray-700 rounded-md p-4 overflow-auto">
            {response}
          </pre>
        </div>
      </div>
    </div>
  );
}
