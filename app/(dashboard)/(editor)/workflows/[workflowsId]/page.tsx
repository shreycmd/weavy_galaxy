import React from "react";
interface Pageprops {
  params: Promise<{ workflowsId: string }>;
}
const WorkflowsId = async ({ params }: Pageprops) => {
  const { workflowsId } = await params;
  return <div>WorkflowsId:{workflowsId}</div>;
};

export default WorkflowsId;
