import { ReplicaRuntime } from "./ReplicaRuntime";

type ReplicaPageProps = {
  html: string;
};

export function ReplicaPage({ html }: ReplicaPageProps) {
  return (
    <main className="replica-page" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function ReplicaPageWithRuntime(props: ReplicaPageProps) {
  return (
    <>
      <ReplicaPage {...props} />
      <ReplicaRuntime />
    </>
  );
}
