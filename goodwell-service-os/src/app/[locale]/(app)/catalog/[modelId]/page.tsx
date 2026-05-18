import { ModelDetailPage } from "./ModelDetailPage";

export default async function Page({ params }: { params: Promise<{ modelId: string }> }) {
  const { modelId } = await params;
  return <ModelDetailPage modelId={modelId} />;
}
