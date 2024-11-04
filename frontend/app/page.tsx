// app/page.tsx

import React from "react";

interface Data {
  message: string;
}

async function fetchData(): Promise<Data> {
  const response = await fetch("http://localhost:8000/api/example/"); 
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

const Home: React.FC = async () => {
  let data: Data | null = null;
  let error: string | null = null;

  try {
    data = await fetchData();
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred";
  }

  return (
    <div className="container">
      {error && <p>Error: {error}</p>}
      {data ? (
        <div>
          <h1>Message from Django API:</h1>
          <p>{data.message}</p>{" "}

        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Home;
