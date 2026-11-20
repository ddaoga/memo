import { WriteMemo } from "../../components/WriteMemo";

export default function NewMemoPage() {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-16 px-16 pt-48">
      <WriteMemo />
    </div>
  );
}
