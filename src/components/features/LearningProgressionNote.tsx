import { LEARNING_STAGES } from "@/lib/courses";

export default function LearningProgressionNote({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p className={`text-sm ${className}`}>
      The &quot;Beginner to Advanced&quot; level label reflects the requested wording;
      advanced coverage is subject to curriculum and instructor validation.
      Learning stages are shared across courses: {LEARNING_STAGES.join(", ")}.
      Your starting point and progression depend on your current skills, goals,
      and pace—not course duration.
    </p>
  );
}
