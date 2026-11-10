import { createEnquiryHandler } from "@/lib/enquiry-handler";

const handleEnquiry = createEnquiryHandler(process.env);

export async function POST(req: Request) {
  return handleEnquiry(req);
}
