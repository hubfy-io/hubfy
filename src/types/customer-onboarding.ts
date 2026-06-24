export type CustomerOnboardingStatus = "draft" | "active" | "inactive";

export type CustomerOnboardingQuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "dropdown";

export interface CustomerOnboardingQuestionOption {
  id: string;
  label: string;
}

export interface CustomerOnboardingQuestion {
  id: string;
  type: CustomerOnboardingQuestionType;
  label: string;
  description?: string;
  required: boolean;
  image_url?: string;
  options?: CustomerOnboardingQuestionOption[];
}

export type CustomerOnboardingAnswers = Record<
  string,
  string | string[] | null
>;

export function createOnboardingQuestion(
  type: CustomerOnboardingQuestionType = "short_text",
): CustomerOnboardingQuestion {
  const id = crypto.randomUUID();
  const hasOptions = ["single_choice", "multiple_choice", "dropdown"].includes(type);

  return {
    id,
    type,
    label: "",
    description: "",
    required: true,
    options: hasOptions
      ? [
          { id: crypto.randomUUID(), label: "" },
          { id: crypto.randomUUID(), label: "" },
        ]
      : [],
  };
}

export function questionTypeNeedsOptions(type: CustomerOnboardingQuestionType) {
  return ["single_choice", "multiple_choice", "dropdown"].includes(type);
}
