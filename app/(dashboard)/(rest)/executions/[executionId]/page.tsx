import React from "react";
interface Pageprops {
  params: Promise<{ executionId: string }>;
}
const ExecutionId = async ({ params }: Pageprops) => {
  const { executionId } = await params;
  return <div>ExecutionId:{executionId}</div>;
};

export default ExecutionId;
