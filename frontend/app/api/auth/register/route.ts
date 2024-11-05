import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, email, password, retype_password } = await request.json();

  const response = await fetch("http://127.0.0.1:8000/api/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, retype_password }),
  });

  if (response.ok) {
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } else {
    const error = await response.json();
    return NextResponse.json(
      { error: error.message },
      { status: response.status }
    );
  }
}
