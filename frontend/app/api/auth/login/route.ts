import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const response = await fetch("http://127.0.0.1:8000/api/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } else {
    const error = await response.json();
    return NextResponse.json(
      { error: error.message },
      { status: response.status }
    );
  }
}
