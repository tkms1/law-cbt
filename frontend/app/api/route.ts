import { NextResponse } from "next/server";
// import prisma from "../../../lib/prisma";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   console.log(req);
//   if (req.method === "GET") {
//     const response = await fetch("http://localhost:8080/realtime");
//     const result = await response.json();
//     return res.status(200).json(result);
//   } else {
//     res.setHeader("Allow", ["GET"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
// export async function GET() {
//   const response = await fetch("https://jsonplaceholder.typicode.com/posts");
//   const jsonData = await response.json();
//   // console.log(jsonData)
//   return NextResponse.json(jsonData);
// }

// キャッシュ用のシンプルなインメモリストレージ（本番環境では Redis などを使う）
const cache = new Map();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lawId = url.searchParams.get("lawId");
  // 1. lawId が null の場合は何も返さない
  if (lawId == null) {
    return new Response(null, { status: 204 }); // 204 No Content を返す
  }

  // 2. キャッシュからデータを取得
  if (cache.has(lawId)) {
    // console.log(`Cache hit for lawId: ${lawId}`);
    return NextResponse.json(cache.get(lawId));
  }

  // 3. 外部 API の URL を構築
  // const fetchUrl = `http://10.254.249.89:8080/laws?lawId=${encodeURIComponent(
    // lawId
  // )}`;

  let fetchUrl = "";
  if (
    lawId == "h08Zj000050301ja14.0_h20R10" ||
    lawId == "h12Zj000030201ja14.0_h18R2" ||
    lawId == "s23Zj000320201ja14.0_h20R17"
  ) {
    fetchUrl = `https://roppou-app.onrender.com/xml-file?code=${encodeURIComponent(
      lawId
    )}`;
    // const fetchUrl = `http://10.254.249.91:8080/xml?code=${encodeURIComponent(
    //   lawId
    // )}`;
  } else {
    fetchUrl = `https://roppou-app.onrender.com/xml?code=${encodeURIComponent(
      lawId
    )}`;
    // fetchUrl = `http://10.254.249.91:8080/xml?code=${encodeURIComponent(
    //   lawId
    // )}`;
  }
  // const fetchUrl = `http://10.254.249.91:8080/xml?code=${encodeURIComponent(
  //   lawId
  // )}`;
  // const fetchUrl = `https://backend-roppou-app.vercel.app/laws?lawId=${encodeURIComponent(
  //   lawId
  // )}`;
  // console.log(`Fetching data from: ${fetchUrl}`);
  // 4. AbortController を使用してタイムアウトを設定
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 5秒でタイムアウト

  try {
    // 5. 外部 API からデータを取得
    const response = await fetch(fetchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    // 6. レスポンスが正常でない場合、エラーを返す
    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `External API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
      return NextResponse.json(
        { error: errorData?.message || "External API request failed" },
        { status: response.status }
      );
    }

    // 7. レスポンスデータを JSON として解析
    const jsonData = await response.json();

    // 8. キャッシュに保存
    cache.set(lawId, jsonData);
    console.log(`Cached data for lawId: ${jsonData}`);

    // 9. データを返す
    return NextResponse.json(jsonData);
  } catch (error) {
    // 10. エラーハンドリング
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Request timed out");
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }

    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("An unexpected error occurred:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
