import React from "react";
interface Pageprops {
  params: Promise<{ credentialId: string }>;
}
const CredentialId = async ({ params }: Pageprops) => {
  const { credentialId } = await params;
  return <div>CredentialId:{credentialId}</div>;
};

export default CredentialId;
